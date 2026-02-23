# Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！

- 發布時間：2023-10-04 07:34:27
- 原文連結：<https://ithelp.ithome.com.tw/articles/10333935>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 19 篇

![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687WHgv6JnSGx.png)

本文進入測試環節。適合對 Riverpod 有實際玩過且熟悉的朋友們，不會特別講解相關開發技巧，我們著重在於如何寫好一個基本的測試，穩固專案的品質。希望由這些範例讓大家更有感，對寫測試不害怕而且喜歡，相信對於自己的專案會有所幫助。

過程中會使用到 **Mocktail** 套件，一個 Dart 的測試模擬工具，由 Bloc 作者 **Felix Angelov** 製作。Mocktail 提供很多簡單使用的 API，讓我們可以輕鬆偽造動作與資料，不需要自己撰寫 Mock Data 或是 Codegen 生成 (就像 **mockito** 套件)。

------------------------------------------------------------------------

## 前置說明

#### ProviderListener

在驗證測試的過程中我們會需要 ProviderSubscription 的 `listen()` 函式，負責監聽 Provider 的狀態變化，利於在測試裡檢查狀態的更新，是否跟我們邏輯流程裡期望的結果一樣。

而在開始之前，首先需要自定義一個 **ProviderListener**，它負責 `listen()` 函式裡的 callback，包含兩個參數，第一個為上一個狀態，第二個為新的狀態。驗證的過程都可以透過它知道 callback 被呼叫幾次，以及狀態是否符合期望。

``` dart
// Mock listener
class ProviderListener<T> extends Mock {
  void call(T? previous, T? next);
}
```

以下是後面會看到的實際範例，由 **listener** 進行驗證

``` dart
// Use Container to listen specific Provider status
providerContainer.listen( 
 testAppThemeModeProvider, 
 listener, 
 fireImmediately: true, 
);
```

#### **FutureProvider**

- 狀態是 AsyncValue，包含 **AsyncLoading**、**AsyncData**、**AsyncError**

#### **AsyncNotifierProvider**

- 狀態是 AsyncValue，包含 **AsyncLoading**、**AsyncData**、**AsyncError**
- `build()` → 負責初始化，允許進行非同步操作，返回 **FutureOr** 型別資料

------------------------------------------------------------------------

## Example 1 (FutureProvider)

### 情境

從本地儲存取得 APP 上次保存的 ThemeMode，透過它可以知道裝置為 light 還是 dark  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687rX9lOpUQt0.png)

### **實作**

首先在每個測試執行前初始化一些物件，進行前置作業。需要 **ProviderContainer** 存取每個 Provider、每個狀態，接著因為此測試要取得本地儲存的資料，需要偽造使用到的 LocalStorage，透過 overrides 覆蓋為 **MockLocalStorage**，準備測試使用。  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ve4TaDEvYr.png)

`makeProviderContainer()` → 方便在初始化時使用，只需給予要偽造的 Provider，以及在測試結束後釋放資源

``` dart
ProviderContainer makeProviderContainer({required List<Override> overrides}) {
    final container = ProviderContainer(overrides: overrides);
    addTearDown(container.dispose);

    return container;
}
```

當使用 `storage.get()` 的時候我想要它返回指定資料，這邊設置為 **true**  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687qwfRV2AU7M.png)

創建一個 Listener，資料類型為 Provider 提供的資料，透過 container 監聽此狀態，利於我們檢查狀態的更新  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ii9bxrJu28.png)

此測試的主角 appThemeModeProvider 本身是 FutureProvider，在還沒完成之前的狀態都是 null 到 Loading，透過 `verify()` 和 `expect()` 進行初步確認

1.  `verify()` 用來驗證狀態的更新

2.  `expect()` 用來檢查目前的 Provider 狀態，跟我們期望是否相同  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687noBbEbzTuE.png)

3.  完成非同步操作，從 MockLocalStorage 取得資料並返回 ThemeMode

4.  驗證 Provider 狀態，從 AsyncLoading 到 AsyncData，並取得 `ThemeMode.light`，因為前面 Mock 的時候我們希望能拿到 true

5.  期望 Provider 狀態，目前的狀態是 AsyncData，內容為 `ThemeMode.light`  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687efZ49T0Bt6.png)

最後驗證 Listener 是不是沒有狀態的更新了，而且存取 LocalStorage 的操作只有一次  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687vGuWXwZR9k.png)

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/201206873Po7NVGf2x.png)

以下為範例程式碼：

``` dart
test(
'Get ThemeMode(light) of APP',
    () async {
    /// arrange
    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) => Future.value('true'));

    /// run
    final listener = ProviderListener<AsyncValue<ThemeMode>>();
    providerContainer.listen(
      appThemeModeProvider,
      listener,
      fireImmediately: true,
    );

    // Check state before completing future
    // 1. by verify
    verify(() => listener(null, const AsyncLoading<ThemeMode>()));
    // 2. by expect
    expect(providerContainer.read(appThemeModeProvider), const AsyncLoading<ThemeMode>());

    // Finish the future operation
    await providerContainer.read(appThemeModeProvider.future);

    // Check state when future completed.
    // 1.
    verify(
      () => listener(
        const AsyncLoading<ThemeMode>(),
        const AsyncData<ThemeMode>(ThemeMode.light),
      ),
    );
    // 2.
    expect(
      providerContainer.read(appThemeModeProvider),
      const AsyncData<ThemeMode>(ThemeMode.light),
    );

    // No new status
    verifyNoMoreInteractions(listener);

    // Only be called one time
    verify(() => storage.get(any())).called(1);
  },
);
```

## Example 2 (AsyncNotifierProvider)

### 情境

本範例一樣是從本地取得 APP 保存的 ThemeMode，不同的是，這裡使用 **AsyncNotifier** 在 `build()` 初始化時從本地取得 ThemeMode，並設置初始狀態。AppThemeModeNotifier 經由 `appThemeModeNotifierProvider` 提供  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687iqbg6dDM38.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687d5BXjUKKoS.png)

### 實作

通常一開始都是先使用 `when()` 和 `then()` 相關 API，進行操作的資料偽照。接著透過 `listen()` 進行 Provider 狀態的監聽  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687jSSe29CITg.png)

1.  首先驗證初始狀態，一樣是 null 到 **AsyncLoading**，並確認之後沒有新的狀態更新了
2.  因為 `appThemeModeNotifierProvider` 類型是 **AsyncNotifierProvider**，這邊使用 await future 等待初始化完成，再進行結果檢查，預期拿到的數值是 **ThemeMode.light**
3.  最後確認資料只有被存取過一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ezxrpy2PJa.png)

測試運行成功  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687an0wpCAfLs.png)

以下為範例程式碼：

``` dart
test(
  'initialize in build() and get ThemeMode.light',
  () async {
    /// arrange
        when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) async => 'true');
    
        /// run
    final listener = ProviderListener<AsyncValue<ThemeMode>>();

    // Listen testAppThemeModeProvider to check status later.
    providerContainer.listen(
      appThemeModeNotifierProvider,
      listener,
      fireImmediately: true,
    );

    // In the beginning, always from null data to Loading state.
    verify(() => listener(null, const AsyncLoading()));
    verifyNoMoreInteractions(listener);

    // Complete build() of AsyncNotifier.
    // Need to use expectLater() to check current state.
    await expectLater(await providerContainer.read(appThemeModeNotifierProvider.notifier).future, ThemeMode.light);

    // Try to get local data from local storage in build().
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
  },
);
```

## Example 3 (AsyncNotifierProvider and Exception)

### 情境

新增 `toggleMode()` 目的為切換 App 的 ThemeMode，驗證過程中在拋出例外後的狀態更新與流程是否正常  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687gl9HodyZlo.png)

### 實作

在測試一開始先安排資料預期的輸出，在存取本地資料的時候希望拋出例外  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687BcBiSQBPZz.png)

當 `listen()` 指定 Provider 狀態的時候，就開始進行 `build()` 的初始化，這時候會去存取 LocalStorage，所以先檢查是否已經呼叫一次  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ZXBIFsVb7E.png)

當存取 LocalStorage 的時候，期望獲得一個例外，可以使用 `throwA(isA<Exception>())`  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687pqfGpdDXFb.png)

檢查兩個狀態更新

1.  第一個情境，在取得目前的 ThemeMode 之前會先更新為 **AsyncLoading** 狀態
2.  第二個情境，從 AsyncLoading 準備取得資料，這時候存取資料會拋出例外，是我們安排的情況，Provider 狀態會更新成有錯誤。錯誤的檢查方式使用 `predicate()`，確認其中 AsyncValue 是否有錯誤，有的話才符合我們要的流程
3.  最後確認資料只有被存取過一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687D3XJtGqbrk.png)

也可以用另外一種方式，檢查狀態型別是否正確

``` dart
() => listener(
    const AsyncLoading(),
    any(
        that: isA<AsyncError<ThemeMode>>(),
    ),
),
```

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687kx5WwwrogO.png)

以下為範例程式碼：

``` dart
test(
  'call toggleMode() but throw exception.',
  () async {
    /// arrange

    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenThrow(Exception('Can not get theme!'));
    when(() => storage.set(LocalStorageKeys.isLightTheme, any<bool>())).thenAnswer((invocation) => Future.value());

    /// run

    final listener = ProviderListener<AsyncValue<ThemeMode>>();
    providerContainer.listen(
      appThemeModeNotifierProvider,
      listener,
      fireImmediately: true,
    );

    // When listen the provider, it will initialize and run build()
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);

    await expectLater(() async => providerContainer.read(appThemeModeNotifierProvider.notifier).toggleMode(), throwsA(isA<Exception>()));

    verifyInOrder([
      // Beginning set the loading state
      () => listener(null, const AsyncLoading()),
      // Error will appear when complete
      () => listener(
            const AsyncLoading(),
            any(
              that: predicate<AsyncValue<void>>(
                (value) {
                  expect(value.hasError, true);

                  return true;
                },
              ),
            ),
          ),
    ]);

    // Call storage.get() again
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
    
  },
);
```

## Example 4 (AsyncNotifierProvider and Stream)

### 情境

在初始 `build()` 和 `toggleMode()` 進行 **Stream** 更新，取得目前的 ThemeMode，檢查狀態是否有按照期望的流程更新  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687B4xBsLt0JT.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687s1MfObf2jv.png)

### 實作

依正常流程來說此範例會存取本地資料 3 次，進行呼叫的次數驗證

1.  因為 Notifier 初始化的關係，一開始在 `build()` 裡存取資料，取得目前設定的 ThemeMode

2.  第二次是在呼叫 `toggleMode()` 時，一開始也會取得資料

3.  第三次則是再更新 ThemeMode 後，刷新 `appThemeModeProvider`，一樣需要存取本地資料。實際上是否要有這個 Provider 狀態還是根據實際開發需求，這裡只是做個範例展示  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687GuqsnFT4CV.png)

4.  檢查 Stream 資料流，我們期望它能照流程給予狀態。先是原本的 ThemeMode.light，再來點擊切換樣式後，更新成 ThemeMode.dark

5.  最後再次驗證 storage 被存取的次數，在這邊為一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687JYizdeB1Ya.png)

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ZJ2wkcVghg.png)

以下為範例程式碼：

``` dart
test(
  'call toggleMode() and check stream data is correct',
  () async {
    /// arrange
    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) async => Future.value('true'));
    when(() => storage.set(LocalStorageKeys.isLightTheme, any<bool>())).thenAnswer((invocation) => Future.value());

    /// run
    await providerContainer.read(appThemeModeNotifierProvider.notifier).toggleMode();

    // call once in build()
    // call once in toggleMode()
    // call once in appThemeModeProvider
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(3);

    expect(
      providerContainer.read(appThemeModeNotifierProvider.notifier).currentModeStream,
      emitsInOrder(
        const [
          ThemeMode.light,
          ThemeMode.dark,
        ],
      ),
    );

    // call once in build()
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
    
  },
);
```

注意：如果是使用 `expectLater()` 來檢查結果的話需要先在操作前定義好，等待操作後的結果，這樣寫測試比較不自然。建議用 `expect()`，可以在操作後進行檢查

------------------------------------------------------------------------

## Tips

- **盡可能的給予泛型**，將型別描述出來，方便閱讀以及查找問題
- 無法確保實際值的時候使用 `any()` 幫助檢查
- 使用 **ProviderSubscription** 搭配自訂義的 **ProviderListener**，監聽 Provider 狀態變化，方便檢查
- 每個測試可以新增自定義的 `timeout` 參數，確保我們的測試在需要時**快速失敗**，不會卡住流程

將一些重複的操作優化成 Extension API，除了方便外，穩定性、可度性都能提高。

``` dart
/// For flutter_test
extension FinderMatchExtension on Finder {
    void never() => expect(this, findsNothing);
    void once() => expect(this, findsOneWidget);
    void times(int number) => expect(this, findsNWidgets(number));
    void some() => expect(this, findsWidgets);
}

/// For mocktail
extension VerificationCalledExtension on VerificationResult {
    void never() => called(0);
    void once() => called(1);
    void twice() => called(2);
    void threeTimes() => called(3);
    void times(int number) => called(number);
}
```

## Problem

在使用 `any()` 或 `captureAny()` 時可能會出現的錯誤

``` bash
Bad state: A test tried to use `any` or `captureAny` on a parameter of type `AsyncValue<void>`, but
registerFallbackValue was not previously called to register a fallback value for `AsyncValue<void>`.
```

需要 `registerFallbackValue()`，否則無法作為值分配給不可為 null 的參數。如果此型別在很多測試裡都會使用到，可以在所有測試執行前進行設置

``` dart
setUpAll(() {
    registerFallbackValue(const AsyncLoading<void>());
});
```

------------------------------------------------------------------------

## 總結

到這裡大家覺得測試好玩嗎？有沒有接受並開始懂的如何寫了呢？其實，不管自己和公司專案有沒有在寫測試，或是有 QA 在幫忙，都應該要重視這一塊。當我們針對邏輯、操作流程、元件做了一層保護，開發、維護上也會更有保障，不是靠其他人驗證就沒問題，我們也不用提心吊膽的進行改版更新。應該讓自己慢慢養成寫測試的習慣，如何在時間與需求的壓力下讓專案趨近於完整和高品質，一直是開發者的課題。

也期許未來能夠看到更多有關測試的經驗談，之後也會在撰寫另一篇有關測試技巧的內容，歡迎大家提出來討論，分享踩坑紀錄，我想應該蠻有趣的！

[Github](https://github.com/chyiiiiiiiiiiii/test_riverpod_with_mocktail?source=post_page-----d67cedbb2722--------------------------------)

------------------------------------------------------------------------

## 延伸閱讀

- [Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色](https://ithelp.ithome.com.tw/articles/10332717)
- [Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？](https://ithelp.ithome.com.tw/articles/10333398)
- [Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？](https://ithelp.ithome.com.tw/articles/10334626)
