# Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！

- 發布時間：2023-09-16 19:00:54
- 原文連結：<https://ithelp.ithome.com.tw/articles/10319282>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 1 篇

![](images/20120687kpFXRVs06e.png)

Dart 3 隨著 Flutter 3.10 發布，進行了一次大改版，達成了 100% sound-null safety，代表所有的屬性、變數都要聲明是否為 nullable，它的作用能讓專案的編譯更有效率、速度更快，也能讓專案的穩定性提升，減少不必要的錯誤和崩潰發生。另外也新增了幾種語言特性 Record、Pattern、Class-Modifier 等等，在開發上給予很大的幫助，在許多情境的使用上更簡單而且可讀性高。

本文主要跟大家分享 Dart 3 給予的好處，希望可以幫助大家快速了解它，並且從中受益。所以我在後面準備了很多實際案例，從基本認識、初階到進階使用，分享一些我覺得很棒的神奇用法，讓我們趕快進入正題吧！

------------------------------------------------------------------------

## Record

Record 是一個匿名且不可變的聚合類型，它可以將多個物件集中在一個物件裡面，一般的使用方式 `(doube lat , double lon)`，使用小括號包裹來認定。可以將它們存儲在變數、將它放入 List、將它當作 Map 的 Key，或者在 Record 中包含其他 Record，用法上非常豐富。

當我們有了 Record，在某些時候就不需要為了單一流程創建新的 Class 來紀錄資料。例如：位置有經緯度、顏色有RGB數值，都能夠很簡單的透過 Record 幫忙。而我們也能藉此解決 function 需要多個回傳值的需求。馬上來看以下範例：

#### Example 1

1.  第一個範例，`getLocation()` 比較常見的情景會是回傳經緯度，這裡透過 Record 去處理，並針對需求決定數值是否有自定義名稱，根據可讀性可自行調整，外部透過 `(double, double)` 去使用
2.  把 Record 當做匿名型別，以這個範例就是擁有兩個命名參數，在賦值的時候也會被要求也給予前置名稱
3.  Record 可以同時擁有匿名參數與命名參數，匿名參數可以透過編號來存取，按照順序從1開始

``` Dart
// Function
(double Lat, double lon) getLocation(String name) => (25.034092, lon: 121.563956);

// Named-args
({double lat, double lon}) location;
location = (lat: 25.034092, Lon: 121.563956);

// Mixed
var person = ('Yii', isMale: true, '175');
print(person.$1);
print(person.isMale) ;
print(person.$2);
```

#### Example 2

Flutter 常見場景，APP 下方需要有底部選單，也就是 `BottomNavigationBar`，但我們不需要創建一個 BottomNavigationBarItem 類別來紀錄名稱以及 Icon 兩個屬性，可以直接使用 Record 代替。而我們在撰寫 UI code 的時候，可以透過編號存取匿名變數

``` Dart
List<(Widget, String)> items = <(Widget, String)>[
    (const Icon(Icons.home), 'Home'),
    (const Icon(Icons.search), 'Search'),
    (const Icon(Icons.face), 'Profile'),
];

BottomNavigationBar(
    items: items
            .map
                ((Widget, String) item) =>
                BottomNavigationBarItem(
                    icon: item.$1,
                    label: item.$2,
                ),
            )
            .toList(),
)
```

### Compare Records

Record 本身的 identity 就是依賴擁有的欄位、匿名以及命名，當兩個 Record 結構一樣時就會是相等的

#### Example 3

1.  我們可以很簡單的寫測試來驗證 Record 是否相同。範例中 a 跟 b 的結構相同所以通過測試，而 c 因為都是匿名參數，所以跟 a 的測試不會通過
2.  沒有實作 `==` operator 的 Object list 進行比對會無法相等

``` Dart
test('Records equality', () {
    // 1.
    const ({int width, int height}) a = (width: 100, height: 200);
    const ({int width, int height}) b = (width: 100, height: 200);

    const (int width, int height) c = (100, 200);
    
    expect(a, equals(b)); // Passed
    expect(a, equals(c)); // Failed

    // 2.
    final complex = (1, 'dog', ['cat', 'pig']);
    final complex2 = (1, 'dog', ['cat', 'pig']);
    expect(complex, equals(complex2)); // Failed
});
```

## Pattern Matching

Pattern Matching 負責檢查 Object 和期望的結構格式是否匹配，符合的話可以存取全部屬性或是部分資料，同時進行了解構，和提高可讀性。實際看範例會更快了解：

#### Example 4

此範例的需求是存取 Json 中的指令欄位。可以先看到左邊的舊式寫法，我們需要先檢查 json 是否為 Map、長度以及是否有正確的 Key，接著檢查個別欄位的型別，再將 value 拿出來使用。過程中經過重重關卡已經寫了10行 code，不覺得有點累嗎？

我們看看右邊 Dart 3 新寫法，透過 **if-case matching** 檢查 json 的結構是否符合兩個欄位，且型別是 String 跟 int，而且不是空值，單純這一行代表著很多條件，而當他們都符合後我就能安心拿值使用。這邊使用到了解構，所以可以直接拿其中的變數使用，總共只寫了2行而已

``` Dart
final json = {'name': 'Amy', 'age': 30};

// Old
if (json is Map<String, Object?> &&
    json.length == 2 &&
    json.containsKey('name') &&
    json.containsKey('age')) {
        if (json['name'] is String && json['age'] is int) {
            final name = json['name'] as String;
            final age = json['age'] as int;
            print('User $name is $age years old.');
        }
}

// New
if (json case {'name': String name, 'age': int age}) {
    print('$name is $age years old.');
} else if (json case {'name': 'Amy', 'age': int age}) {
    print('Amy is $age years old.');
} else {
    print('Error: json is not correct.');
}
```

#### Example 5

解構用法，同時進行結構比對，符合的話直接使用，不需要額外再宣告新的變數

``` Dart
final names = [
    Person(name: 'Yii', age: 27),
    Person(name: 'Andy', age: 30),
    Person(name: 'Jay', age: 24),
]

final [yii, andy, jay] = names;
print(yii.toString());
print(andy.toString());
print(jay.toString());
```

#### Example 6

更輕量的解構方式，當你想要直接使用原本 Record 裡的命名。解構屬性值，過程中宣告一個與屬性相同名稱的 getter

``` Dart
const position = (x: 0, y: 2);
final (:x, :y) = position;
print('$x, $y');
```

## Switch Expression

更精簡的 switch 檢查，不需要 case 與 return 回傳，簡撰寫條件的同時使用 Pattern Matching，並且能使用 `when` 進行第二層的條件驗證，最終返回結果，可讀性也直覺。

#### Example 7

此範例展示了我們可以直接在 UI code 根據某個狀態的變化給予相對應的內容，不需要多層的 if-else，直接使用 switch 來檢查。假設有一個教學頁面，有 5 個步驟可以切換，每個步驟顯示的文字內容都不同。

1.  可以看到第三行是 `_` ，通常代表為 else，並且第二個條件為不是最後一頁，這邊是指 2、3 索引
2.  最後在使用 `_`，沒有其他條件，就是 else 本人，這邊是 4 索引也是最後一頁

``` Dart
ElevatedButton(
    onPressed: _goNext,
    child: Text(
        switch (_currentPage) {
            0 => 'Start',
            1 => 'Next',
            _ when _currentPage != _LastPage => 'Next',
            _ => 'Confirm',
        },
    ),
)
```

#### Example 8

範例中針對狀態都進行忽略，主要是根據第二層的 `when` 條件檢查，根據不同的情境顯示不一樣的內容，最後為 else 不符合的情況

``` Dart
switch (pageState) {
    _ when pageState.isLoading => '載入中..',
    _ when pageState.content.isNotEmpty => state.content,
    _ => '發生未知錯誤',
}
```

#### Example 9

此範例的情境是要取得 List 物件裡的倒數第2個元素，返回指定字串，如果不符合則回傳另一個結果。

1.  第一行，使用中括號包裹等於是 List，第一個元素使用 spread operator 表示，在 Dart 代表0個以上的元素
2.  第三個使用 `_` 表示，因為沒有要使用，只是為了要確保有最後一個元素
3.  第二個為我們需要的元素，給予變數名稱，幫符合結構時可以拿來使用
4.  第二行，因為這個情境需要有兩個以上的元素，所以這裡需要 handle 例外，如果是 List 為空或是只有一個元素，就返回另一個字串
5.  外面接著使用 result 去做後續處理

``` Dart
List<int> numbers = [1, 2, 3];

final result = switch (numbers) {
    [..., final num, _] => 'Number is $num',
    [] || [_] => 'Need more numbers',
};

print(result) ;
```

## Class Modifier

從 Dart 3 開始，支援很多類別的修飾符，讓開發者可以精準的定義類別的擴展性，根據不同的 library file 會有不同的限制，對我們有很大的幫助。以下介紹所有修飾符：

1.  `base` class → 只允許繼承
2.  `interface` class → 只允許實作
3.  `final` class → 禁止繼承、實作和混合
4.  `mixin` class → 混合類別。目前一般類別已經不允許當成 mxin

``` Dart
// Failed
class NormalClass {}
class FirstClass with NormalClass {} 

// Passed
mixin class MixinClass {}
class SecondClass with MixinClass {}
```

5.  `sealed class` → 密封類別，針對繼承關係的操作 Compiler 會幫忙檢查，當有子類沒有處理的話就會出錯

有效的 modifier 組合與使用方式可以查看官方提供的列表，告訴你每種方式是否可以建構、繼承、實作、混合，或是詳盡編譯檢查  
![](images/20120687aIBceTba84.png)

以下表格為互斥和不適合的組合方式：  
![](images/20120687JsdYWJSXWr.png)

#### Example 10

此範例使用了 `sealed` class、`final` class，和 switch expression 操作，讓大家更有感覺。首先情境是需要進行網路請求，並將回應分為成功與失敗兩個類別，裡面包裝對應的資料。

1.  Response 類別使用 `sealed` 去定義，`Success` 與 `Failure` 繼承 Respose，泛型為我們的目標型別

``` Dart
sealed class Response<T> {}

final class Success<T> extends Response<T> {
    final T data;
    Success({required this.data});
}

final class Failure<T> extends Response<T> {
    final Exception exception;
    Failure({required this.exception});
}
```

2.  `getPerson()` 是我們的請求方法，回傳值為 `Response<Person>`，注意中間部分，請求完之後檢查 statusCode，200的話確認成功，先將 json 解析成 Map，再透過 `fromJson()` 取得 Person 物件，最後回傳 `Success` 子類。而其他 statusCode 代表失敗，直接返回 `Failure` 子類
3.  另外下面有在提供新的 switch expression 寫法，幫大家複習一下如何在實際場景中使用

``` Dart
Future<Response<Person>> getPerson({required int id}) async {
    try {
        final uri = Uri.parse('http://io.com/persons/' + id.toString());
        final response = await http.get(uri);
        
        // 1. Normal switch
        switch (response.statusCode) {
            case 200:
                final data = json.decode(response.body);
                return Success(data: Person.fromJson(data));
            default:
                return Failure(exception: Exception(response.reasonPhrase));
        }

        // 2. Switch expression
        final result = switch (response.statusCode) {
            200 => Success(data: Person.fromJson(json.decode(response.body))),
            _ => Failure<Person>(exception: Exception(response.reasonPhrase)),
        };

        return result;
    } on Exception catch (e) {
        return Failure(exception: e);
    }
}
```

4.  請求完在外部取得 Response 物件，但是我們需要檢查是 Success 還是 Failure，一樣透過 switch expression 進行 pattern matching，如果為成功就可以使用 person 物件並返回字串，失敗就回傳錯誤訊息，最後將結果印出來

``` Dart
final response = await getPerson(id: 1);

final result = switch (response) {
    Success(data: final person) => person.toString(),
    Failure(exception: final exception) => exception.toString(),
}

print(result);
```

------------------------------------------------------------------------

到這裡我們簡單說明了 Dart 3 有的新東西 Record、Pattern Matching、 Class Modifier 等等用法，並且附上 10 個範例，大家應該有了解他們且迫不及待想再自己的專案上開發了。如果你覺得意猶未盡，可以閱讀我的下一篇 Dart 3 文章，會跟大家分享更多的實際案例，讓我們一起享受其中吧！

另外，如果你想看影片聽聲音學習的話，可以觀看我在 Google IO Extended 上的分享，裡面有講解到以上範例，也歡迎有時間的話將影片看完，你會更了解 Flutter 以及 Dart。以下是影片連結：

[Google IO Extended 2023 - What's good in Flutter 3.10 and Dart 3?](https://www.youtube.com/watch?v=YhbXrlb32qQ&t=312s&ab_channel=YiiChen)

[![Yes](images/0.jpg)](https://www.youtube.com/watch?v=YhbXrlb32qQ)

------------------------------------------------------------------------

## 延伸閱讀

[Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！](https://ithelp.ithome.com.tw/articles/10320379)

## Reference

1.  <https://github.com/dart-lang/language/tree/main/accepted/3.0>
2.  <https://dart.dev/language/modifier-reference>
3.  <https://medium.com/dartlang/a1f4b3a7cdda>
4.  <https://www.aloisdeniel.com/blog/dart-pattern-matching>
5.  Pascal Welsch - Exploring Records and Patterns
