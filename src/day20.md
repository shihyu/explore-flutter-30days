# Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？

- 發布時間：2023-10-05 14:40:07
- 原文連結：<https://ithelp.ithome.com.tw/articles/10334626>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 20 篇

![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687ljLfmVOv4I.png)

Riverpod 是什麼？相信大家都已經有初步了解了，甚至大家都已經運用在自己的專案了對吧？它本身的使用方式很多樣，是個很靈活的框架，但在很方便開發的同時，也很容易造成多成員開發方式不同的問題，所以需要有規範去執行，不管是個人還是團隊都一樣，如果本身對專案與程式碼品質有要求的話，相信大家都是對自己很有要求的開發者。

本文要講解幾種 Riverpod 的日常使用，在同一個需求情境下，其實有多種能完成的方式，如何做正確選擇，需要等你們實際玩過才會得知。另外，也會分享一些開發技巧，希望能夠有效的提升開發效率，進而讓我們喜歡使用 Riverpod。話不多說，馬上開始吧

------------------------------------------------------------------------

假設今天我們要請求 API 取得 User 資料，會如何使用？其實用 **Provider**、**FutureProvider**、**Notifier**、**AsyncNotifier** 等等都可以實作，差別就是根據操作情境來選擇，以下一起來看看每個 Provider 使用的差異性。

## 1. Provider

使用基本的 Provider 來處理非同步操作。以範例來看，實際上 Provider 可以執行非同步任務，使用 async 將資料回傳。

``` dart
final userProvider = Provider((ref) async {
    return ref.watch(userRepositoryProvider).getUser();
});
```

所以外部可以直接 await `ref.read()` ，就跟我們使用一般的 async method 一樣。不同的是，使用 Provider 同時也會將第一次的結果狀態緩存起來，也就是說，當第二次第三次存取 **userProvider** 的時候，會回傳剛剛處理的結果，不會在執行新的請求。

``` dart
final user = await ref.read(userProvider);
debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

這時候可能有人會問，可以每次存取的時候都重新請求嗎？當然可以，不過需要額外的釋放操作，也就是使用 `invalidate()`，使指定 Provider 無效，將緩存的狀態丟掉，同時 Provider 也被釋放了，在下次存取時就會重頭來過。

``` dart
final user = await ref.read(userProvider);
ref.invalidate(userProvider);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

當然我們也可以使用 `ref.refresh()`，它跟 `invalidate()` 差異就是直接重新來過並且回傳結果，其實過程就是先執行釋放接著再存取一次，算是個更便捷的 API。

``` dart
final user = await ref.refresh(userProvider);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

`refresh()` 就相當於先 `invalidate()` 在 `read()`，可以根據喜好還有情境去選擇。

``` dart
final user = await ref.refresh(userProvider);

==

ref.invalidate(userProvider);
final user = await ref.read(userProvider);
```

## 2. FutureProvider

使用 FutureProvider 請求 User 資料。大家應該知道會傳的結果都是 AsyncValue，因為是非同步就會有載入中、成功和錯誤三種狀態，所以大家常用的情境是跟 UI 綁在一起，根據狀態來顯示對應的元件。透過 `ref.watch()` 監聽狀態的方式，我們可以這樣實作

``` dart
final userProvider = FutureProvider.autoDispose((ref) async {
    return ref.watch(userRepositoryProvider).getUser();
});

// In UI
ref.watch(userProvider).when(
    data: (User data) {
        return Text(data.name);
    },
    loading: () {
        return const CircularProgressIndicator();
    },
    error: (error, stacktrace) {
        return const Text('Oops!');
    },
)
```

> 範例中的 Provider 我都會使用 `autoDispose` modifier，它主要的功能就是當 Provider 沒有被使用被監聽的時候釋放掉，有效節省資源，避免忘記處理記憶體。在大部分的情境中，需要自動釋放的時刻會比較多，可以養成習慣。甚至如果使用 Riverpod 的 Codegen 寫法的話(本文不會講解)，預設 Provider 都是 `autoDispose`，所以開發起來就更方便。當然如果大家會自己管理釋放時機的話就不需要添加，一樣的受根據需求去做選擇。

這時候也許有人會問，我可以跟 Provider 或是一般非同步方法一樣，直接呼叫並取得結果嗎？當然可以。使用 Provider 擁有的 `future` 屬性，可以讓我們取得結果，同時將結果緩存起來，所以如果之後在存取 Provider 的時候，會回傳舊的資料。

``` dart
final user = await ref.read(userProvider.future);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

## 3. NotifierProvider

使用 NotifierProvider 請求 User 資料。Notifier 不同的是初始化寫在 `build()`，我們可以在內部定義一些相關的方法來做額外的一些處理，可以存取狀態或是更新狀態，在此範例增加了兩個方法， `getUser()` 取得資料、 `updateUser()` 更新狀態為新的 User。

Notifier 本身是同步的，所以回傳值就是我們的 User，不過因為預設值的部分，在一開始我們還沒有請求資料所以預設為 null。接著再呼叫裡面寫好的方法 `getUser()`，等請求成功之後再進行狀態的更新，這時候畫面也會同時反應。

``` dart
final userProvider = NotifierProvider.autoDispose<UserNotifier, User?>(UserNotifier.new);

class UserNotifier extends AutoDisposeNotifier<User?> {
    @override
    User? build() {
        getUser();

        return null;
    }

    Future<User> getUser() async {
        final user = await ref.read(userRepositoryProvider).getUser();
        state = user;

        return user;
    }

    Future<void> updateUser(User user) async {
        state = user;
    }
}
```

在 UI Code，一開始的去讀取 **userProvider**，這時候就會觸發 Notifier 裡的 `build()` 並請求 User 資料。接著在使用 `watch()` 監聽狀態變化，等待更新後同步 rebuild。而在這裡因為狀態一開始預設為 null，所以如果點擊按鈕要更新的話，先檢查是否為 null，這裡透過 Dart3 的 If-Case Matching 幫忙檢查，有值我們才呼叫 `updateUser()` 去更新狀態。

``` dart
@override
void initState() {
  super.initState();

  ref.read(userProvider);
}

@override
Widget build(BuildContext context) {
    final user = ref.watch(userProvider);

    return Scaffold(
        body: Center(
            child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    Text(user?.name ?? ''),
                    ElevatedButton(
                        onPressed: () {
                            final newUser = user?.copyWith(id: 2, name: 'Jay');
                            if (newUser case final newUser?) {
                                ref.read(userProvider.notifier).updateUser(newUser);
                            }
                        },
                        child: const Text('Update User'),
                    ),
                ],
            ),
        ),
    );
}
```

![NotifierProvider](https://i.imgur.com/gJG2Skm.gif)

如果要前面的跟 Provider 一樣直接取得 User 呢？就可以把 Notifier 當作 Controller，透過裡面的 `getUser()` 直接取得資料。當然取得後 **userProvider** 裡的狀態也會被刷新。

``` dart
final user = await ref.read(userProvider.notifier).getUser();

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

------------------------------------------------------------------------

## 4. AsyncNotifierProvider

使用 AsyncNotifierProvider 請求 User 資料。以範例來看，跟 Notifier 類似，只是它專門處理非同步狀態，狀態會被 AsyncValue 包裹，這樣的好處是當我們存取 Provider 時也會有 Loading 跟 Error 狀態可以處理，直接針對幾個狀態去顯示對應的 UI，不需要額外在自定義相關狀態。

``` dart
final userProvider = AsyncNotifierProvider.autoDispose<UserNotifier, User>(UserNotifier.new);

class UserNotifier extends AutoDisposeAsyncNotifier<User> {

    @override
    FutureOr<User> build() {
        return getUser();
    }

    Future<User> getUser() async {
        final user = await ref.read(userRepositoryProvider).getUser();

        return user;
    }

    void updateUser(User user) {
        update((data) => user);
    }

}
```

UI Code 的寫法都差不多，在這裡新增了一個按鈕，負責更新原本的 User 狀態。所以再點擊後，會呼叫 **UserNotifier** 的 `updateUser()`，將 User 設置給它，這時候畫面也同時響應、刷新。

``` dart
ref.watch(userProvider).when(
  data: (User data) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(data.name),
        ElevatedButton(
          onPressed: () {
            final newUser = data.copyWith(id: 2, name: 'Jay');
            ref.read(userProvider.notifier).updateUser(newUser);
          },
          child: const Text('Update User'),
        ),
      ],
    );
  },
  loading: () {
    return const CircularProgressIndicator();
  },
  error: (error, stacktrace) {
    return const Text('Oops!');
  },
)
```

![AsyncNotifierProvider](https://i.imgur.com/gJG2Skm.gif)

跟前面一樣，那 AsyncNotifierProvider 直接觸發非同步任務的方式呢？第一種方式透過 future，如果是第一次存取 Provider，就會初始化執行 `build()`，裡面會請求資料並緩存，而我們也可以拿到新的狀態回傳值。

``` dart
final user = await ref.read(userProvider.future);
```

第二種方式，跟 Notifier 一樣，直接呼叫 `getUser()` 取得最新資料，這樣的話就不會管緩存狀態，每次都會重新請求並取得結果。

``` dart
final user2 = await ref.read(userProvider.notifier).getUser();
```

## 選擇方向

到這裡我們已經觀察了四種 Provider 對於相同需求的撰寫方式，實際當然需要根據情境、邏輯、資料流等等去選擇，不過這邊可以順便給大家幾個方向：

- **Provider**
  1.  物件、服務提供者 → 讓很多情境、需求下都存取相同實體
  2.  資料反應者 → 負責監聽其他狀態，並提供處理後的緩存資料
- **FutureProvider**
  1.  非同步執行者 → 單純取得非同步結果，沒有其他額外對於狀態的操作，例如：API 的 Get 請求、讀取資料庫
- **Notifier**
  1.  邏輯與狀態的管理者 → 需要自定義某個需求、功能的狀態類，並透過其他操作控制狀態。例如：當成 feature 或 page 的 Controller、ViewModel、功能的集中處理地，當今天需要有載入或是錯誤的狀態，可以自定義，自行提供
- **AsyncNotifier**
  1.  跟 Notifier 一樣，只是需要在初始就取得非同步數據，並且大部分操作都有非同步狀態的支援，像是 **AsyncData**、**AsyncLoading**、**AsyncError**

## Example - 網路監聽

在 Flutter 開發，當我們需要檢查網路是否連接時，很常會使用 `connectivity_plus` 套件。以下整理了幾種檢查和存取網路狀態的方式，進而讓大家更了解 Riverpod 的靈活性。

### StreamProvider

使用 StreamProvider 創建一個 Stream，持續的給予最新狀態。

1.  首先創建 Connectivity 實體，並在一開始主動取得連線狀態，並 **yield** 新增第一個值給資料流
2.  接著持續監聽狀態變化，當有更新時新增狀態給資料流，使用 **yield**\*，處理

``` dart
final hasInternetStreamProvider = StreamProvider.autoDispose<bool>((ref) async* {
    final connectivity = Connectivity();

    yield (await connectivity.checkConnectivity()).hasInternet;
    yield* connectivity.onConnectivityChanged.map((result) => result.hasInternet);
});
```

完成 UI 畫面根據網路狀態反應的需求  
![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687g0dttbsKgJ.png)

``` dart
@override
Widget build(BuildContext context) {
    final hasInternet = ref.watch(hasInternetStreamProvider).value ?? false;

    return hasInternet ? const WelcomeInfoWidget() : const CircularProgressIndicator();
}
```

其中，看到 ConnectivityResult 有一個 `hasInternet` getter，它是自定義的 Extension api，方便後續的實作，方便快速。

``` dart
extension ConnectivityResultExtension on ConnectivityResult {
    bool get hasInternet => switch (this) {
        ConnectivityResult.mobile || ConnectivityResult.wifi => true,
        _ => false,
      };
}
```

### StreamProvider - part2

另一種寫法，使用自己的 StreamController 來管理資料流。

1.  首先這裡順便把 Connectivity 物件獨立出來，讓其他 Provider 共同存取它

``` dart
final connectivityProvider = Provider<Connectivity>((ref) {
    return Connectivity();
});
```

2.  使用 StreamProvider 搭上 `autoDispose()`，在 Provider 沒有使用時被釋放、銷毀
3.  首先取得 connectivity 實體，並創建一個 StreamController，負責處理資料
4.  跟前面範例一樣，先取得當前狀態並添加到 Stream，讓監聽者可以被通知
5.  接著在 `onConnectivityChanged()` callback 等待資料更新，添加狀態給 Stream，讓外部監聽著收到通知，做後續處理與反應
6.  最後關鍵點，需要在 `onDispose()` 將資源釋放

``` dart
final hasInternetStreamProvider = StreamProvider.autoDispose<bool>((ref) async* {
    final connectivity = ref.watch(connectivityProvider);
    final streamController = StreamController<bool>();

    final currentStatus = (await connectivity.checkConnectivity()).hasInternet;
    streamController.add(currentStatus);

    final subscription = connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
        switch (result) {
            case ConnectivityResult.mobile || ConnectivityResult.wifi:
                streamController.add(true);
            case _:
                streamController.add(false);
        }
    });

    ref.onDispose(() {
        subscription.cancel();
        streamController.close();
    });

    yield* streamController.stream;
});
```

UI 的寫法都一樣，根據狀態顯示元件  
![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687tUOarnT7W0.png)

### NotifierProvider

使用 NotifierProvider 實作，方便將每個操作切分開來，實作過程都差不多。

1.  在 `build()` 給予初始值 false，因為還沒監聽到狀態變化
2.  執行 `initConnectivity()`，持續等待狀態更新，有新的狀態就觸發 `onStateDetected()` 更改當前的緩存數據
3.  最後在 `onDispose()` 釋放資源，結束 **streamSubscription** 物件

``` dart
final hasInternetNotifierProvider =
    NotifierProvider.autoDispose<InternetStatusNotifier, bool>(InternetStatusNotifier.new);

class InternetStatusNotifier extends AutoDisposeNotifier<bool> {
    StreamSubscription<ConnectivityResult>? _streamSubscription;

    @override
    bool build() {
        initConnectivity();
        onDispose();

        return false;
    }

    void initConnectivity() {
        _streamSubscription = Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
        bool newState = false;

        switch (result) {
            case ConnectivityResult.mobile || ConnectivityResult.wifi:
                newState = true;
            case _:
                newState = false;
        }

        onStateDetected(newState: newState);
        });
    }

    void onStateDetected({required bool newState}) {
        if (state != newState) {
            state = newState;
        }
    }

    void onDispose() {
        ref.onDispose(() {
            _streamSubscription?.cancel();
            _streamSubscription = null;
        });
    }
}
```

UI Code 的部分跟 StreamProvider 不同，狀態不是 AsyncValue，可以直接拿來使用。

``` dart
@override
Widget build(BuildContext context) {
    final hasInternet = ref.watch(hasInternetNotifierProvider);

    return hasInternet ? const WelcomeInfoWidget() : const CircularProgressIndicator();
}
```

> 其實此範例應該使用 AsyncNotifier 處理，因為一開始沒有取得當前狀態，透過 `checkConnectivity()` 的非同步操作取得，把它當成初始值。大家可以思考自己的需求，或是嘗試進行修改，過程會更熟悉更有趣。

## 分享一個開發技巧

在本文快結束的地方，順便分享一個好用的 UI 開發技巧，自定義 Extension Api 來協助我們。有經驗的朋友們應該知道 AsyncValue 是什麼，以及它的方便性，透過三種狀態來顯示指定元件。

當在 UI 處理了很多個 AsyncValue 後應該會發現有一些重複的程式碼，像是普遍 loading 跟 error 狀態都是相同的處理程序，這時候就可以將它們賦予預設動作，有效簡化開發。

範例：

1.  撰寫自定義的 `simpleWhen()`，在 **loading** 和 **error** 狀態設置預設的顯示元件，也包含其他 APP 預期的非同步操作
2.  每次主要處理都是在 **data** 成功狀態，可以根據資料給予預設值， 像這裡就是如果遇到空資料就顯示特定文字，固定呈現方式，確保一致性
3.  正常情況下只需要在呼叫時給予 `data()` callback 就完成 UI code，非常的簡潔、快速，省時又省力

``` dart
extension AsyncValueExtension<T> on AsyncValue<T> {

    Widget simpleWhen({
        required Widget Function(T data) data,
        Widget? empty,
        bool skipLoadingOnReload = false,
        bool skipLoadingOnRefresh = false,
        bool skipError = false,
    }) =>
        when(
            data: (tempData) {
                if (tempData is List) {
                    return tempData.isNotEmpty ? data(tempData) : Center(child: empty ?? const Text('目前沒有資料哦'));
                }

                return data(tempData);
            },
            loading: MyLoading.new,
            error: (error, stackTrace) => MyError(),
            skipLoadingOnReload: skipLoadingOnReload,
            skipLoadingOnRefresh: skipLoadingOnRefresh,
            skipError: skipError,
        );

}
```

------------------------------------------------------------------------

## 總結

到這裡應該篇幅稍長，最主要是想分享一些使用 Riverpod 的想法，它的靈活性很大，根據需求有各種實作方式，希望能讓大家更快的解決問題，並懂得如果操作每個 Provider 來幫助專案開發。Riverpod 本身很強大，但也很容易有自己的寫法，造成專案資料流的混亂，不像 Bloc 狀態管理有嚴謹的流程與限制，團隊這時候就需要統一規範，每個情境的開發想法才會一致，確保專案品質的標準。

最後，大家對於 Riverpod 開發技巧有興趣嗎？如何高效使用它，這個部分會再發佈另一篇文章來說明，大家可以期待一下！

------------------------------------------------------------------------

## 延伸閱讀

- [Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色](https://ithelp.ithome.com.tw/articles/10332717)
- [Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？](https://ithelp.ithome.com.tw/articles/10333398)
- [Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！](https://ithelp.ithome.com.tw/articles/10333935)
