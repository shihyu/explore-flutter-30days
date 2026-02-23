# Day 13: 在 Dart 與 Flutter 開發中常用的幾種 Pattern，為什麼需要它們？

- 發布時間：2023-09-28 21:20:13
- 原文連結：<https://ithelp.ithome.com.tw/articles/10329956>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 13 篇

![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687eKB4zBtrCH.png)

Pattern 在每個領域的軟體開發當中都會遇到，有時候大家很常使用但卻沒有實際了解為什麼要這樣設計，他們都是為了解決某件事，讓我們很方便的完成開發。而在開發 Flutter App 時，有幾種 Pattern 是很常遇到跟使用的，例如：**Singleton**、**Factory**、**Builder** 和 **Repository** 等等，這四種也是本文的重點，跟大家講解他們是什麼，以及如何在實際的場景使用，提高效率。

------------------------------------------------------------------------

## Singleton Pattern

- 只允許 Class 實例化一次，之後的所有存取都針對同一個記憶體空間、同一個物件
- 常見做法為三步驟
  1.  提供 `._internal()` 內部方法來創建，內部的命名可自定義
  2.  使用 **static final** 宣告 `_instance` 實體，在第一次類別初始化後可以在所有實體上分享，不需要創建重複的記憶體也不能再更改
  3.  使用 `factory` constructor 方法存取內部創建的物件實體

``` dart
class AppStorage {
    static final AppStorage _instance = AppStorage._internal(); 

    factory AppStorage() => _instance;

    AppStorage._internal(); 

    String message = 'Wish you a good day!';
}

/// Usage
print(AppStorage().message); // Wish you a good day!
```

根據需求，在真正需要的時候才使用 **Singleton**，否則正常使用下應該創建後釋放資源，而不是永遠存在記憶體佔空間，濫用反而會造成效能差異。

補充：以 Riverpod 狀態管理為例，使用方式有類似支援 Singleton，它能夠透過 Provider 提供單一實體讓大家去使用，並在沒有人需要的時候自動釋放、銷毀，能自然、方便的管理記憶體，也是它的一大好處。

## Factory Pattern

- 工廠模式，也被稱為 `Virtual Constructor Design`，專門處理建構子
- 可協助定義多個 Class Constructor，不需要將類別內部屬性設為參數，可以自定義，並返回類別實體，在使用上可以更簡潔

``` dart
class Car {
    final Color color;

    Car(this.color);

    factory Car.green() {
        return Car(Colors.green);
    }

    factory Car.red() {
        return Car(Colors.red);
    }
}
```

- 特點本身可以是匿名的，可偽裝成預設 Constructor，提高整體可讀性，不需要被迫提供無意義的名稱。而當類別內部只有命名 Constructor 時，會保留預設的匿名 Constructor，不會發生錯誤

``` dart
class Car {

    factory Car() {
        return Car();
    }

}
```

當你撰寫預設 Constructor 時，會跳出錯誤訊息，說明匿名 Constructor 已經被宣告了  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687MyCSNR5AOF.png)

- 不需要給予回傳值或泛型參數，提高整體可讀性
- 可以重新指向到另一個 Constructor，包含預設以及命名構造函數，靈活性高

``` dart
class Car {
    factory Car() {
        return Tesla();
    }

    factory Car.blueTesla() {
        return Tesla.blue();
    }
}

class Tesla implements Car {
    Tesla({this.color = 'black'});

    final String color;

    factory Tesla.blue() => Tesla(color: 'blue');
}
```

- 可以宣告為 `const`，提高效能

``` dart
void main(List<String> arguments) {
    const car = Car();
    print(car);
    // Instance of 'Tesla'
}

class Car {
    const factory Car() = Tesla;
}

class Tesla implements Car {
    const Tesla({this.color = 'black'});

    final String color;
}
```

當只有重新指向的操作可以是 **const**，這點在使用時請注意。  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687DBgOu2Ck87.png)

- 當有多個參數要進行傳遞時，可以使用語法糖協助，只需要給予類別的名稱，確保建構參數都相同即可  
  ![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687zLKdjJ3RRn.png)

- 開發時使用 **factory** 的常見場景

  - Singleton Pattern 單例
  - Json Deserialization 資料的反序列化解析
  - Instantiate Subclasses 子類別創建
  - Union Classes 聯盟類別

### Example - Json deserialization

我們在請求完 API 後，通常會需要解析 Json 為指定的 Model 資料類別，中間會使用 **factory** 的 `fromJson()` 方法去取得物件，中間就是將 Map 參數處理完後返回物件。參數本身也跟類別屬性沒有關係。

不管是使用 **json_serializable** 或是 **freezed** 套件都會使用到 factory constructor 去實作。

``` dart
class User {

    final String name;
    final int age;

    User({
        required this.name,
        required this.age,
    });

    factory User.fromJson(Map<String, dynamic> json) => User(
        name: json['name'],
        age: json['age'],
    ); 
}

// freezed
@freezed
class User with _$User {
    const factory User({
        required String name,
        required int age,
    }) = _User;

    factory User.fromJson(Map<String, Object?> json) => _$UserFromJson(json);
}
```

> 補充：對於 freezed 套件有興趣的朋友可以看我之前完成的文章，延伸閱讀  
> [Medium: “freezed” makes model class strong and easily](https://yiichenhi.medium.com/freezed-makes-model-class-strong-and-easily-cf5388bb94b7)

### Example - ****Instantiate subclass****

根據需求以及不同的參數資料，我們可以在類別裡面定義多個 **factory constructor**，不同的情境下產出不同的子類別實體，使用上更為豐富。

``` dart
class Human {

    factory Human.age({required int age}) {
        if (age >= 18) {
            return Man();
        } else {
            return Child();
        }
    }

}
```

### Example - **Union Classes**

在 **freezed** 套件裡，針對多狀態的定義，在這裡會使用到很多 factory constructor，很適合用於狀態管理的狀態識別，例如：搭配 Bloc、Riverpod 等等。

``` dart
@freezed
class HomeState with _$HomeState {
    factory HomeState.init() = HomeInitialization;
    
    factory HomeState.loading() = HomeLoading;

    factory HomeState.dataLoaded(List<Movie> movies) = HomeLoaded;
    
    factory HomeState.error(String message) = HomeError;
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687osk2au0RxE.png)

Factory Pattern 在很多地方都適合使用，我們在定義專案的 Design System 時也會用到，比如要撰寫自己的 AppText 元件，定義出與 UI 設計相同文字配置，透過 factory constructors 先將文字大小、顏色、長寬先定義好，之後在撰寫 UI 畫面時就會非常方便。

## Builder Pattern

首先以 Builder 元件來看，它最主要的功能是什麼？就是所戴的參數 BuildContext，也就是給子元件一個精準的上下文、在 Element Tree 上新增一個節點，讓元件在執行 context 操作時更安全，而不會導致跨層級存取的問題。詳細可閱讀我撰寫的 Element 文章，幫助你更好理解，以下是連結：

> [Day 4: Flutter 高效核心，了解 Element 生命週期與使用](https://ithelp.ithome.com.tw/articles/10322382)

**builder** 的使用在 Flutter 開發過程中是很常見的一個使用方式，例如：`ListView.builder()`、`GridView.builder()`、`TableView.builder()`、`PageView.builder` 等等，大部分的共通點都是有提供 BuildContext，就是為了效能優化而提供的 API。

- 可以根據需求來決定是否創建 **builder** 提供的元件，如果不需要則不理會
- 可以只更新指定元件，而不會重建其他的兄弟姊妹，造成不必要的資源消耗

### Example - ListView.builder()

![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687aRvccqTQRF.png)

直接快速從源碼來看，實際上 ListView.builder() 裡的 context 就是 **SliverMultiBoxAdaptorElement**，每個 Item 都有自己的 Element 處理更新。  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687MXbGY0e2vr.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687vSbKiwHFqJ.png)

### Example - StatefulBuilder

以 StatefulBuilder 來看，為什麼它能做到局部刷新？實際上當它包裹的時候跟我們創建一個字定義元件一樣，包裹了新的 context 也就是 Element 來處理狀態，所以當我們觸發 `setState()` 的時候，只有包裹的 Widget Tree 會有反應，進而刷新。

``` dart
await showDialog<void>(
    context: context,
    builder: (BuildContext context) {
        int? selectedRadio = 0;

        return AlertDialog(
            content: StatefulBuilder(
                builder: (BuildContext context, StateSetter setState) {
                    return Column(
                        mainAxisSize: MainAxisSize.min,
                        children: List<Widget>.generate(4, (int index) {
                            return Radio<int>(
                                value: index,
                                groupValue: selectedRadio,
                                onChanged: (int? value) {
                                    setState(() => selectedRadio = value);
                                },
                            );
                        }),
                    );
                },
            ),
        );
    },
);
```

## Repository Pattern

在 Mobile 開發裡使用 Repository Pattern 是很常見的，從 Android、iOS 到 Flutter，觀念都可以運用到各個平台去幫助開發，Repository 最主要的職責就將 UI layer 和 Data layer 進行有效分離。對於 UI 來說，不用管中間的資料拿到後如何處理，只需要專注在取得資料後如何呈現出來。

Repository 就是保管資料的倉庫，以存取資料的情境，在這裡我們可以根據網路情況來決定要拿雲端資料是本地資料，所以通常會有 RemoteDataSource 與 LocalDataSource，接著透過原本定義的 API 取出指定資料。目的為了讓專案分層清楚，每個角色只需負責好自己的工作就好，Repository 就是那位資料管理者，能夠有效地協助我們。

- 透過 **SOLID** 開發原則，定義抽象介面，使用依賴反轉來解耦服務纇、工具類與資料來源。進而提升可測試性，撰寫測試時也能輕鬆偽造注入物件的邏輯與數據
- 擁有可替換性。當使用的第三方 API 發生異常想更換成其他服務時，只需更新 Repository 的注入實體，即可透過統一介面取的資料
- 適合情境
  - 請求遠端資料，例如：Rest API
  - 與本地溝通，例如：SharedPreference、Hive Storage、Isar Database
  - 與遠端服務溝通，例如：Firebase、Supabase、AWS Amplify
  - 存取設備 API，例如：Permission、Location、Camera
- 缺點
  - 比較多樣板代碼，是 tradeoff，以個人經驗來看是個良好設計。但如果只是小 project 的話，就取決於個人需求

### Example

假設我們需要實作註冊、登入有關用戶身份的相關操作，可能會有個 AuthRepository，它單純負責定義介面，跟直白的來說就是有幾種方式可以操作資料。以這個範例來看有註冊、登入以及 Goolge 登入。給予實作類別使用 AuthRepository 介面

在 Dart 3 改版之後，我們可以更精準的定義 Class，建議使用 `abstract interface class`，符合舊有觀念的 interface。  
![](https://ithelp.ithome.com.tw/upload/images/20230928/201206873IeY8DpdXF.png)

假設情境是實作有關會員身份有關的功能，這時候可能會創建新的 **AuthRepositoryImpl** 類別 implements **AuthRepository**，需要覆寫設置好的方法。接著在 Logic layer 注入 Repository 實體，就能直接呼叫 `signUp()` 完成工作，邏輯層完全不需要知道 Repository 到底做了什麼事，完整地將職責切分開來。  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687YMHkhzdBqi.png)

而當我們要測試的時候就可以創建偽造類別，自定義每個 API 的結果，根據場景需求去撰寫。  
![](https://ithelp.ithome.com.tw/upload/images/20230928/20120687JNqIsJ7Ozf.png)

假設今天的測試場景為登入 API，登入的用戶名稱正常情況下會包含 “Ba” 兩個字母，因此有了以下的簡易測試範例。首先使用了 MockAuthRepository 實體，透過偽造資料進行測試，驗證邏輯是否正常。這也是為什麼建議 Repository Pattern 和其他職責類別使用 abstract interface 的原因。

``` dart
late MockAuthRepository temp;

setUp(() {
    temp = MockAuthRepository(firebaseAuth: FirebaseAuth.instance, authApi: AuthApi(Dio()));
});

tearDown(() {});

test('SignIn test for only "Ba" user', () async {
    final res = await temp.signIn(params: SignInRequestParams(email: 'test@gmail.com', password: 'test1234'));

    expect(res.user.name.contains('Ba'), true);
    expect(res.user.name.contains('unknown'), false);
});
```

補充：

1.  Repository 是否需要抽象類來繼承取決於你和團隊的開發習慣，因為通常 Repository 只會有一種實現方式，不像是 Service 需要應付可替換性，一切都需要權衡，看是需要簡潔的介面宣告還是減少樣板代碼、節省時間
2.  撰寫測試時，推薦搭配 **mocktail** 套件，更方便偽造類別或是資料來源，不需要 Codegen 處理。當然 mocktail 適合大部分情境，不只侷限與 Repository Testing

------------------------------------------------------------------------

## 總結

閱讀完此篇，大家應該對於常見的 Pattern 設計更有感覺了，相信在未來的專案開發上會更知道如何適當地去使用，當發生問題時我們也能更快的做出反應。實際上，Pattern Design 有非常多種，個人不建議死背，可以透過日常開發和反覆練習去熟悉。另外，個人推薦作者 **Mangirdas Kazlauskas** 之前分享的 Design Pattern 大全，透過自己的 Flutter Web 去呈現，提供解說與範例，有興趣的朋友們不要錯過了，我將連結附在這裡。

> [Flutter Design Patterns (Flutter Web)](https://flutterdesignpatterns.com/)

那，我們下篇文章見囉！

## 參考

- <https://dash-overflow.net/articles/factory/>
