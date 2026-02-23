# 上冊（Day 1-15）

## Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！

- 發布時間：2023-09-16 19:00:54
- 原文連結：<https://ithelp.ithome.com.tw/articles/10319282>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 1 篇

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687kpFXRVs06e.png)

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
![](https://ithelp.ithome.com.tw/upload/images/20230916/20120687aIBceTba84.png)

以下表格為互斥和不適合的組合方式：  
![](https://ithelp.ithome.com.tw/upload/images/20230916/20120687JsdYWJSXWr.png)

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

[![Yes](https://img.youtube.com/vi/YhbXrlb32qQ/0.jpg)](https://www.youtube.com/watch?v=YhbXrlb32qQ)

------------------------------------------------------------------------

## 延伸閱讀

[Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！](https://ithelp.ithome.com.tw/articles/10320379)

## Reference

1.  <https://github.com/dart-lang/language/tree/main/accepted/3.0>
2.  <https://dart.dev/language/modifier-reference>
3.  <https://medium.com/dartlang/a1f4b3a7cdda>
4.  <https://www.aloisdeniel.com/blog/dart-pattern-matching>
5.  Pascal Welsch - Exploring Records and Patterns

## Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！

- 發布時間：2023-09-17 19:49:43
- 原文連結：<https://ithelp.ithome.com.tw/articles/10320379>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 2 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687mm11qSGYxL.png)

當 Dart 3 添加 Record 和 Pattern 等等強大的功能後，讓它成為了很有吸引力的語言，非常值得我們花時間與它相處，輕鬆、快速地在專案寫出好的代碼。

以下分享了 9 個範例，希望幫助你對 Dart 有更深一層的了解，建議邊看邊使用 IDE 練習，將結果印出來，相信你會更有感覺更有記憶，每一刻都很重要，我們不要浪費了，跟著我往下閱讀吧：

------------------------------------------------------------------------

### Example 1

有了 Dart 3 之後，在使用 **Pattern Matching** 時同時很容易使用到 **Destructure 解構**，透過 spread operator `...` 輕鬆幫我們處理 List 操作，寫起來快速又簡單。以下方的案例來看，存取第一個和最後一個元素，中間我們直接忽略。

以這個情境來看，需要確保元素有兩個以上才不會出錯，因為 `first` 與 `last` 變數不是空值，如果只有一個元素的話會直接報錯。

``` dart
final [first, ..., last] = [2, 4, 6, 8, 10];
debugPrint('$first, $last'); // 2, 10

final [first, ..., last] = [2, 4];
debugPrint('$first, $last'); // 2, 4

final [first, ..., last] = [2];
debugPrint('$first, $last'); // throw exception
```

### Example 2

此範例展示 **Pattern Matching** 的一個技巧 **if-case matching**，讓我們在針對 nullable 變數檢查的時候能更簡潔快速，也稱為 **Null Gauard**，編譯器能確保變數不在 null 這個範圍。不僅在撰寫商業邏輯上還有 UI code 的層面都很好使用。以下列出原有寫法以及新的方式：

1.  舊有寫法，當變數不在同一個 block，而我們要確保它不是空值，就會需要使用 `if` 來檢查，它的缺點就是即便已經確認不為 null，但裡面在存取變數的時候還是要給預設值
2.  新的寫法，使用 **if-case matching**，後方可以決定變數是否為空，而且還可以自定義變數名稱，一行即可完成驗證，使用起來簡單俐落
3.  第三個部分，可以允許變數為 null 的範例，根據實際需求去撰寫

``` dart
int? age;

void main() {
    // Old
    if (age != null) {
        printAge(age ?? 0);
    }

    // New, check value is not nullable.
    if (age case final int age) {
        printAge(age);
    }
    
    // New, allow nullable value
    if (age case final int? age) {
        printAge(age ?? 0);
    }
}

void printAge(int age) {
    debugPrint('Age is $age.');
}
```

### Example 3

此範例使用了 **Record**、**Patter Matching**、**Switch Expression**，搭配 enum 進行條件檢查，當我們有多個變數需要進行判斷的時候，就不需要再使用多層的 if-else 來處理，程式碼會很腫脹、冗長，使用 Record 包裝多個變數，裡面只需列出你會遇到的幾種條件，最後其他情境在使用 `_` 去表示就好，寫起來簡潔、可讀性高。

``` dart
enum AccountType {
    vip,
    member,
    guest,
}

void main() {
    bool isAuthenticated = true;
    bool isPaid = true;

    final type = switch ((isAuthenticated, isPaid)) {
        (true, true) => AccountType.vip,
        (true, false) => AccountType.member,
        (_, _) => AccountType.guest,
    };

    debugPrint("This account is ${type.name}");
}
```

### Example 4

此範例使用 `typedef` 來建立方便的 Record 快捷類別，有時候我們只需要簡單的類別來保存一些屬性，並且可以根據屬性來進行物件比對，具有 equatable 功能。使用 `typedef` 搭配 Record 實現一種仿類別的快捷方法。

> 額外要提醒大家，Record 本身不是類別，只要是欄位與表示方式相同，就會被當成同一個 type

``` dart
typedef Student = ({String name, int number});

extension StudentExtension on Student {
    void sayHi() {
        debugPrint('Hi, I am ${this.name}. No.$number');
    }
}

void main() {
    const Student student = (name: 'Yii', number: 1);
    student.sayHi();
}
```

### Example 5

Class Equality with Record，實現跟 `equatable` 套件一樣的功能，用來比對類別物件是否相同。這件無聊的事情透過 Dart 3 來改善

#### Old

在 operator 方法內有幾個屬性就要對幾個屬性進行比對，會寫的很冗長，當然 hashCode 也是一樣

``` dart
@override
bool operator ==(covariant Location other) {
    if (identical(this, other)) return true;
    return other.country == country && other.id == id;
}

@override
int get hashCode => Object.hashAll([country, id]);
```

#### New

使用 **Record** 整個開發氛圍就不一樣了XD，透過一個 `_equality()` 方法幫我們處理比較的部分，這也是 **Record** 的特性，而我們在 operator 以及 hashCode 的撰寫就能以很輕鬆的方式來完成，有效提升簡潔性

``` dart
class Student {
    Student({
        required this.name,
        required this.number,
    });

    final String name;
    final int number;

    (String, int) _equality() => (name, number);

    @override
    bool operator ==(covariant Student other) {
        if (identical(this, other)) return true;
    
        return other._equality() == _equality();
    }

    @override
    int get hashCode => _equality().hashCode;
}
```

#### Example 6

在某些時候需要讀取一個 Map，從中解析並存取一些資料。以舊的寫法來看，需要進行多層的型別以及空值檢查，再將指定欄位的內容拿出來。這寫法應該沒有人會喜歡吧，看得頭都暈了

#### Old

``` dart
final dynamic json = {
    'data': [
        {'name': 'Andyy'},
        {'name': 'Anby'},
        {'name': 'Ancy'},
        {'name': 'Andy'},
    ]
};

bool hasAndy = false;

if (json.containsKey('data')) {
    final data = json['data'];
    if (data is List) {
        for (final item in data) {
            if (item is Map) {
                if (item.containsKey('name') && item['name'] == 'Andy') {
                    hasAndy = true;
                }
            }
        }
    }
}

print(hasAndy); // true
```

#### New

使用 Dart 3 改善，其中使用了 **Switch Expression**、**Pattern Matching**、**Destructure**，以輕鬆的方式取解析 Map，整體都變得更有可讀性。

``` dart
final hasAndy = switch (json) {
    {'data': List items} => items.any((element) => switch (element) {
            {'name': 'Andy'} => true,
            _ => false,
        }),
    _ => false,
};

print(hasAndy); // true
```

### Example 7

此範例要解析 array 取得顏色的 RGB 數值。首先我們需要先檢查長度，在檢查內容物是否為字串不為 null，最後存取他們

#### Old

``` dart
final rgb = [255, 255, 255];

if (rgb.length == 3) {
    final red = rgb[0];
    final green = rgb[1];
    final blue = rgb[2];

    if (red is int && green is int && blue is int) {
        debugPrint('$red, $green, $blue');
    }
}
```

#### New

簡潔寫法只需要用到 **if-case matching**，接著進行解構，符合條件就能安心存取資料了。真是寫起來很舒服

``` dart
final rgb = [255, 255, 255];

if (rgb case [int red, int green, int blue]) {
    debugPrint('$red, $green, $blue');
}
```

### Example 8

此範例為運動功能的情境，有個 Exercise 物件，需要從它的屬性來判斷是單組還是超級組，取出對應的屬性來使用，最後返回元件。這裡使用了 **Switch Expression**、**Pattern Matching** 和 **Destructure** 來實作

第一個方式，前連兩個條件因為有使用到 `when` 執行第二層檢查，代表 exercise 物件不為 null，接著透過第二層確認 singleSetAction 和 superSet 是否為 null，正確的話就返回指定元件。在這個情境下其中一個會有值，一個會是空值。

``` dart
return switch (exercise) {
    _ when exercise.singleSetAction != null => _SingleSetItem(data:      exercise.singleSetAction!),
    _ when exercise.superSet != null => _SuperSetItem(data: exercise.superSet!),
    _ => const SizedBox.shrink(),
};
```

第二個更簡潔的方式，省略 `when` 用法，直接進行 Exercise 解構，其中針對欄位給予不為 null 的變數，符合的話就會返回元件。一樣先檢查 singleSetAction 再檢查 superSet，有解構後，代碼撰寫上更快速了，不覺得 Dart 很聰明嗎？

``` dart
return switch (exercise) {
    Exercise(singleSetAction: final ExerciseAction singleSetAction) => _SingleSetItem(data: singleSetAction),
    Exercise(superSet: final SuperSet superSet) => _SuperSetItem(data: superSet),
    _ => const SizedBox.shrink(),
};
```

### Example 9

此範例的寫法在 Dart 3 之前就有了，只不過很少人知道。範例告訴大家其實不為空的變數也可以不用在宣告時給予 `late` 或是預設值，Dart 會自動檢查過程中是否每個情境都有處理，而不會讓變數違反原本的行為。以下面的程式碼來說，在變數下方使用了 `try-catch`，進入 try 的時候我們進行賦值，而有錯誤的時候我們再丟出新的例外，所以後面在使用 **price** 變數的時候不會出錯，因為 Dart 知道情境上符合預期， Compiler 已經給予保證。

兩種情況可以這樣使用：

1.  try 和 catch 都進行賦值
2.  try 賦值 catch 丟出例外，不讓程式繼續往下進行

``` dart
int price;

try {
    price = 20;
} catch (error) {
    // 1.
    price = -1;
    // 2.
    throw Exception(error);
}

debugPrint(price.toString());
```

針對 `if-else` 情境也可以這樣使用，假設 true 跟 false 的情境都有賦值或是有丟出例外一樣能編譯正常，Dart 已經知道不會有問題，所以變數可以不需要 `late` 和預設值

``` dart
int getPrice(bool canKnowPrice) {
    int price;

    if (canKnowPrice) {
        price = 20;
    } else {
        // 1.
        price = -1;
        // 2.
        throw Exception('Something wrong.');
    }

    return price;
}
```

> 以上的用法跟 `late` 用法差異就是，假設我們使用 `late` 來宣告 price，它代表我們自己保證變數一定會初始化和賦值，所以編譯器不會幫忙檢查，所以這時候如果沒有寫測試來確保沒問題，你的程式就有可能報錯，APP 可能會崩潰。

------------------------------------------------------------------------

以上例子都是從日常開發中會遇到的情境，實際上 Dart 3 淺力無窮，只怕你駕馭不了它。我們唯有透過日常的練習去熟悉它，強化自己的觀念意識，慢慢就能寫出高品質的程式碼。也建議大家多多閱讀 Dart 官方網站以及 Github repo，了解新用法來改善自己和公司的專案！

------------------------------------------------------------------------

## 延伸閱讀

- [Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！](https://ithelp.ithome.com.tw/articles/10319282)

## 相關資源

- <https://dart.dev/language/patterns>
- <https://dart.dev/language/records>
- <https://dart.dev/language/branches>
- <https://twitter.com/_eseidel/status/1692031211177476435>
- <https://www.youtube.com/watch?v=j3fzeDpd2ts&t=45s&ab_channel=RobertBrunhage>
- <https://www.aloisdeniel.com/blog/dart-pattern-matching>

## Day 3: 最熟悉的朋友 Flutter Widget，你會用但真的了解它嗎？

- 發布時間：2023-09-18 22:01:58
- 原文連結：<https://ithelp.ithome.com.tw/articles/10321643>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 3 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687a6p2VuQNYH.png)

所有 Flutter 開發者從 Widget 開始，通過嵌套的方式來完成聲明式 UI，可以讓我們輕易實現腦中的畫面與效果，大家一定跟它非常熟悉吧。但它除了是畫面上的一個元素外，大家是否了解它的核心概念，它的特性、能力、如何刷新、在什麼情況下對整體性能最好，當深入了解它後我們就能更輕鬆的去建置 UI，APP 的品質也能更完整。

以下整理了有關 Widget 的幾個重點角色與說明，我們一起來認識它吧！

------------------------------------------------------------------------

## Widget

![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687MAPdM13L7L.png)

- Widget 顧名思義就是元件，也是畫面的一部分，實際上是一個不可變的配置、描述。描述一個 UI 元素的配置，就是 Widget 接收的參數。例如對於 Text 來講，文字內容、顏色、對齊方式、風格樣式都是它的配置參數
- 創建 Widget 時同時會創建一個對應的 Element，接著 Widget 會被 `inflate()` 到 Element，由 Element 控制，管理生命週期。當 Widget 發生變化，新舊 Widget 會透過 `canUpdate()` 進行比較，主要觀察 `runtimeType` 以及 `key`，由 Element 決定更新或是重建
- Widget Class 上的註解 `@immutable` ，代表是不可變的實體，屬性都為 **final**。如果需要 mutable 則會使用 StatefulWidget
- `Key` → 設置 LocalKey 與 GlobalKey。決定是否在下一次 build 的時候使用舊的 Element 與 RenderObject
- `createElement()` → 在創建 Widget 時，會先使用此方法生成對應節點的 Element，Element 為元件的核心、管理者。在 Flutter 裡 Element 有幾種，包含 StatelessElement、StatefulElement、InheritedElement、RenderObjectElement
- `canUpdate()` → 靜態方法，當兩個元件刷新時，決定是否使用舊 Widget 對應的 Element 更新配置，只要 `runtimeType` 和 `key` 同時相等時就會更新，否則就會銷毀並創建新的 Element
- `_debugConcreteSubtype()` → 在開發時會使用，當進行 hot reload 會導致 Element 執行 `updateChild()`，過程中用來辨別 Widget 類型  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687EZYehiv5p0.png)

## StatelessWidget

- 不需要狀態的元件，創建之後就不會再更改外觀，適合不需要維護狀態的場景去使用
- 核心為 `StatelessElement`， 由 override `createElement()` 創建，也因為是 ComponentElement 所以不用創建 RenderObject
- 生命週期相當簡單，初始化到 `build()` 渲染
- 相關元件：Text、Container  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687ASRTbj5NGj.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687JQw9Ei0I4T.png)

## StatefulWidget

- 有狀態的元件，適合需要保存、更新狀態的場景
- 與 StatelessWidget 相同， 由 `createElement()` 創建 `StatefulElement`，管理 Widget 以及 State。也因為是 ComponentElement 所以不用創建 RenderObject
- 在初始化時必須要在 `createState()` 提供一個 State 物件，通常會與元件名稱相同，後綴加上 State，讓它幫忙紀錄狀態。`State` 本身會保持與 `context` 永久性的關聯，而 context 實際上就是 Element
- 一個 StatefulWidget 對應一個 State 與一個 Element，State 與 Element 實體不會被多個元件同時使用
- 相關元件：MaterialApp、Image  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687QtcR36jtQK.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/201206879x1viB898O.png)

## State

- 掌握元件需要的狀態，當狀態更新時可以使用 `setState()` 方法進行刷新，會再次執行最重要的 `build()` 方法，讓新的 Widget Tree 可以根據新的狀態給予不同的效果呈現
- 當 Parent 節點刷新時，當前 State 會透過 Widget 的 `canUpdate()` 檢查新舊元件的 **runtimeType** 和 **key**，相同時會使用新配置更新原本的 Element 配置，並觸發 `didUpdateWidget()` 方法，參數為舊元件的配置，可以進行一些處理
- State 相關操作都由 Element 掌控
- 生命週期，以下提供簡易說明
  - `createState()` → 創建 State。此時的狀態為 **created**
  - `initState()` → 初始化 State
  - `didChangeDependencies()` → 依賴的數據、狀態有更新。此時的狀態為 **initialized**
  - `didUpdateWidget()` → 新舊元件更新、替換的時候
  - `reassemble()` → 執行 hot reload
  - `build()` → 建立 Widget Tree。此時的狀態為 **ready**
  - `deactivate()` → 停止活躍，當被移出 Widget Tree 的時候
  - `dispose()` → 銷毀 Widget、State 和 Element，釋放資源。此時的狀態為 **defunct**

> 詳細的生命週期解說可以閱讀另一篇文章 (等待發布)

![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687tnrUAvjmRe.png)

### setState()

- 基礎認知就是觸發元件刷新。告訴 Flutter Framework 有狀態改變了需要執行 rebuild，根據狀態呈現不同內容
- 背後主要透過 Element 觸發 `markNeedsBuild()`，標記 Widget 需要更新，並將 `_dirty` 屬性設置為 true，代表待會進行處理
- 需要注意 callback 不能是 async 非同步操作，因為整個 Rendering pipeline 是同步進行，需確保即時與高效能，否則會出錯

> 如果想要更深入的了解 `setState()`，可以閱讀此篇文章 (等待發布)

### 為什麼 Flutter 要將 StatefulWidget 和 State 分開？

- 一切為了高效。只要配置、屬性更新， StatefulWidget 就會被丟棄並重新創建，它實際上只是一個 Element 掌握的外觀配置，消耗成本很低。最重要的是 **State** 和 **Element**，需確保兩者能持續被使用，不要被銷毀
- `State` 會持續存在，由於不會在每次 StatefulWidget 重建時都被丟棄，避免了昂貴的成本消耗，可以不斷地透過重建 `Widget` 以響應新的配置並保持狀態、效果可以連貫，這也是 Flutter 動畫存在的原因

## BuildContext

- BuildContext 本身是一個抽象介面，對於 Widget 來說它實際上是 `Element`，能避免直接對 Element 進行操作，只暴露開發需要的 API
- `build()` 方法的 `BuildContext` 參數，表示元件在 Widget Tree、Element Tree 中的上下文、位置，能進行樹上操作的一個核心，可以直接存取樹上的資料  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/201206871rhXfDjlIH.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687H5MvCdk6sX.png)

從 **StatelessElement** 來看，在 `build()` 執行時，使用 `StatelessWidget-build()`，並將自己 `this` 當參數給予，化身為 Widget 裡的 **BuildContext**。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687Sw52EWmeXJ.png)  
從 **StatefulElement** 來看，在 `build()` 執行時，使用 `State-build()`，並將自己 `this` 當參數給予，化身為 Widget 裡的 **BuildContext**。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687LF1YQleZFJ.png)  
![widget-element](https://i.imgur.com/ZMw4OuI.gif)  
by Flutter

當我們在 StatefulWidget 使用 `context` 時，它實際上就是檢查 `_element` 屬性是否為 null，並進行回傳。在存取的情況下必須確保 context 有綁定到 Element Tree 樹上，才能讓相關操作正常運行。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687B20X4B2VUN.png)

### mounted

- 一個布林值 getter，代表 Widget、State 與 Element 是否有連結並在樹上了，這時候才可以執行 `setState()`
- 最好的習慣是在執行 `setState()` 方法進行刷新時，可以先透過 `mounted` 檢查是否 State 和 Element 在樹上，因為過程會需要 Element 執行樹上操作，避免當下處在和 `dispose()` 階段。實際上就是確認 Element 是否為空值  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687lNYBjdYfxK.png)

``` dart
// StatelessWidget usage
context.mounted

// StatefulWidget usage
mounted
```

在另一篇文章我們有提到了 **Synchronous BuildContexts** 觀念，基本上在處理任何的非同步操作後，如果要存取 context，都必須先使用 `mounted` 確認樹上狀態，否則可能會出錯哦。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687whnkQlbPG3.png)

> 詳細說明可閱讀此篇文章 (等待發布)

### findAncestorWidgetOfExactType()

- 允許從當前元件開始向上遍歷 **Widget Tree**，查找父級元件的方法
- 使用前需確保 context 在樹上的位置，否則會找不到東西。最簡易的方式是使用 **Builder** 進行子原件包裝

實際範例，當我們使用 `findAncestorWidgetOfExactType()` 時有可能會找不到實際的元件，有可能父節點沒有提供，會是 nullable 變數，這時候就可以使用 Dart 3 提供的 **if-case matching** 來處理，方便我們存取資料。

``` dart
class DemoPage extends StatelessWidget  {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Builder(
          builder: (context) {
            final scaffold = context.findAncestorWidgetOfExactType<Scaffold>();

            if (scaffold case final Scaffold scaffold) {
              return ColoredBox(
                color: scaffold.backgroundColor ?? Colors.transparent,
                child: const Text('Hello'),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

}
```

提醒：建議先熟悉 BuildContext 與 Element 兩者的關係，再使用 findXXX 和 dependXXX 相關 API 會比較合適，否則盡量減少使用，避免發生錯誤時不知道原因。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/201206873JoCsURQk4.png)

------------------------------------------------------------------------

本文主要跟大家分享什麼是最根本的 Widget，以及常見的 StatelessWidget、StatefulWidget、State、BuildContext，當了解他們的能力以及關係後，在開發時就能更有感覺。當元件 rebuild 的時候，可以很清楚知道原因、過程，以及是否有效率的在處理這些任務。先有個基本概念，也不需要死記它們，多看多了解，自然就能越來越熟悉。

另外， InheritedWidget 以及 RenderObjectWidget 沒有在這裡提到，細節很多會造成篇幅太長，有需要的朋友可以留言或讓我知道，我會再額外撰寫其他文章來介紹它們。

------------------------------------------------------------------------

## 延伸閱讀

[Day 4: Flutter 高效核心，了解 Element 生命週期與使用](https://ithelp.ithome.com.tw/articles/10322382)

## Day 4: Flutter 高效核心，了解 Element 生命週期與使用

- 發布時間：2023-09-19 18:47:02
- 原文連結：<https://ithelp.ithome.com.tw/articles/10322382>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 4 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687Nfy82nd9Vc.png)

相信大家對於 Widget 的接觸已經很熟悉了，那 Widget 是誰在管理的？這時候要幫忙請出背後的主角了，也就是 **`Element`**，身為 Flutter 高效的核心支柱，它管理著 Widget 和 RenderObject，包含 Pipeline 的 build、layout、paint 幾個工作階段，所以它非常重要。

本文主要說明 Element 身份、生命週期，以及正確的使用方式，希望可以幫大家建立良好的觀念，有效提升開發品質。那我們就不多話了，直接往下開始吧！

------------------------------------------------------------------------

- Element 身為三棵樹的核心，擁有 Widget 和 RenderObject 的實體，是兩者的管理者與溝通管道。掌管 Widget 的生命週期、管理 State 狀態的儲存與更新、操控 RenderObject 佈局與繪製
- 跟 Widget 有著一對一的對應關係，當 Widget 創建時相對應就會有一個 Element 被創建，Widget 本身是 Element 的配置，而 Element 實際上就是 Widget 裡的 `BuildContext`
- Element 創建起來很昂貴，通常建議頻繁更新並持續使用它，盡量避免銷毀和重建。除非 `runtimeType` 和 `Key` 不同，當 `Widget-canUpdate()` 返回 false，這時候就會重建

與 Widget 的初始互動。以 StatelessWidget 為例，在創建 Element 的同時，會將自己交給 Element 管理。實際上 Widget 就是一個描述配置。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687kYdTssNXf0.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687POxq6qLNOQ.png)

與 RenderObject 的初始互動。以 ErrorWidget 為例，它就是我們在開發時遇到錯誤的紅色畫面。本身沒有 child 所以使用 **LeafRenderObjectWidget**，本身的 RenderObject 為 **RenderErrorBox**，那它什麼在什麼時候被創建呢？在 RenderObjectElement 綁到樹上的時候，會透過 Widget 使用 `createRenderObject()` 產生 原本設置好的 RenderObject，也就是 **RenderErrorBox**  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687CUOiFiGn50.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687ycfCjHtlDR.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687CIbK3Hrz0O.png)

Element 的特殊 `slot` 屬性，主要給 Parent 節點用來辨別 child 在 List 的位置。當使用 `Element-updateChild()` 時，過程中會進行 `Element-inflateWidget()`，參數為子元件跟它的 slot 所屬位置。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687sUVQGxT22h.png)

而前面我們有提到 Element 實際上是 `BuildContext`，可以從 **StatelessElement** 和 **StatefulElement** 來確認 。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687YleM4H1m10.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687cmGz8j7eGH.png)  
Element 本身實作了 `BuildContext` 。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687veG63xDHga.png)

## Element 生命週期

### 1. mount()

當 Element 第一次添加到樹時，進行狀態的初始化。狀態從預設的 **`initial`** 轉為 **`active`**。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687qmvMDiJV2j.png)

以 StatefulWidget 的 **ComponentElement** 為例，一開始都會先呼叫父類的基礎操作，在進行個別處理。會先確保 `_lifecycleState` 為 `active` 才進行初始 build。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687yROTSeH20p.png)

StatefulElement 覆寫了`_firstBuild()`，過程中會陸續檢查和變更 State 的生命週期狀態，接著執行 `didChangeDependencies()`，然後透過父類的 `_firstBuild()` 觸發 `ComponentElement-performRebuild()` 和 `Element-performRebuild()`，最終執行 State 裡的 `build()`，將 Widget Tree 創建出來。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687HvMxlJTIzg.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687KqZocf6sa4.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687et6Fk2dKBZ.png)

### 2. activate()

激活之前經過 `deactivate()` 釋放的元素，它們的特點是擁有 **GlobalKey**，狀態從 **`inactive`** 轉為 **`active`**。重新分配舊有的 State 和 Element 給新的 StatefulWidget。

從 StatefulElement 來看，一開始執行 `Element-activate()`，當中會檢查狀態是否為 `inactive`，將它更新成 `active` 狀態。最後安排此 Element 和 Widget 進行 rebuild。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687c4pd5o5b0c.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687sgJNdhrJLP.png)

在開發時，我們也可以在 State 裡覆寫 `activate()`，但通常不太需要用到。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687oDFHP4X6Gj.png)

### 3. update()

透過新的元件更新 Element 配置，這也是最理想的操作，盡可能地讓 Element 使用 `update()`，實現最小消耗。

從 StatefulElement 來看，當使用新的元件更新時，會先執行父類別 `Element-update()`，檢查實體不同並且在透過 Widget 的 `canUpdate()` 檢查 **runtimeType** 和 **key**，確保都相同後才會更新配置。

![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687SIwoIpcGHU.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687sWmmNMtTA2.png)

接著更新 State 的 `_widget` 屬性，並執行 `didUpdateWidget(oldWidget)` 參數為舊的元件配置，我們在開發時就能透過此方法進行一些狀態操作或是資源釋放。最後執行 `rebuild()`  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687RDO24hQVWZ.png)

### 4. deactivate()

當 Element 從 Element Tree 中移除或移動時觸發，狀態從 **`active`** 轉為 **`inactive`**。可能 Widget 的 runtimeType 或 key 發生了變化，當其中一個條件不符合時，Element 會從樹上被移除，最終被銷毀是放掉。

不過 Element 還有機會被再次使用，可以經由 **Tree Surgery** 實現。當元件本身設置 GlobalKey 時，如果元件替換階層或是移動到其他 Widget Tree，Element 和 State 可以再次被激活。在當前幀觸發 `activate()` 和 `update()`，最終回歸 **`active`** 狀態。如果沒有被 reactivated 就會被銷毀。

從 StatefulElement 來看，首先會觸發 State 的 `deactivate()`，跟 `activate()` 一樣我們可以做一些處理。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687teewFA47cJ.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687YOS2AGQ9lJ.png)

接著呼叫父類 `Element-deactivate()`，確保為 active 狀態，最終更新成 **`inactive`**。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687MZiS26G4VX.png)

### 5. unmount()

如果 Element 在當前 frame 期間沒有被重新激活，它將從 Element Tree 解綁並且不能再重複使用，狀態從 **`inactive`** 轉為 **`defunct`**。

從 StatefulElement 來看，會先執行父類的 `unmount()`，檢查是否已經 deactivate 並且狀態為 **`inactive`**，接著針對有設置 GlobalKey 的 Element 進行釋放，不需要再保存在清單裡，最終將 `_lifecycleState` 更新成 **`defunct`**。

接著呼叫 State 的 `dispose()`，也是我們很熟悉的方法，負責用來釋放資源。最後將 State 實體和 element 物件都更新成 null，完整地避免記憶體洩漏。這時候 State 也無法在執行 build 了  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687NoAPmQo9iH.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687y3BNTgD7Ye.png)

## BuildContext Access Correctly

此範例有一個 HomePage，按鈕打開 BottomSheet 進行顯示，透過 `Scaffold.of(context)` 取得 ScaffoldState(藉此可以知道 Scaffold 本身是一個 StatefulWidget)，使用 `showBottomSheet()` 開啟，但是這時候會出現無法存取 **Scaffold** 的相關訊息。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687vEJMdcsosD.png)

``` dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: TextButton(
        onPressed: () {
          Scaffold.of(context).showBottomSheet(
            (context) => const SizedBox(
              height: 200,
              child: Text('Dash!'),
            ),
          );
        },
        child: const Text('Hi!'),
      ),
    );
  }
}
```

錯誤訊息：`Scaffold.of() called with a context that does not contain a Scaffold.`

``` dart
======== Exception caught by gesture ===============================================================
The following assertion was thrown while handling a gesture:
Scaffold.of() called with a context that does not contain a Scaffold.
```

由訊息我們可以得知 context 從樹上找不到 **ScaffoldState**，代表沒有 Scaffold 元件，那是問什麼呢，範例上不是有嗎？我們進到 static `of()` 方法來一探究竟，其中透過 context 使用了 `findAncestorStateOfType()` 從祖先、父節點查找 **ScaffoldState**，找到就直接回傳，否則會丟出例外，也就是我們看到的訊息。  
![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687lbgQ0pnB7S.png)

從範例來看，我們使用 `Scaffold.of(context)` 的 context 是來自於上層，而不是在 Scaffold 裡面的節點，所以往上找當然就找不到。如果 HomePage 第一頁，通常上層就會是根元件的 **MaterialApp**，那層還沒有使用任何的 **Scaffold** 元件，所以才會導致錯誤。

### 正確方式

#### 1. 包裹 Builder

在元件外層包裹 `Builder` 元件，對於該層次提供一個 `context`，創建一個樹上節點，讓我們可以存取到之前的祖先、父節點。

``` dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    body: Builder(
      builder: (context) {
        return TextButton(
          onPressed: () {
            Scaffold.of(context).showBottomSheet(
              (context) => const SizedBox(
                height: 200,
                child: Text('Dash!'),
              ),
            );
          },
          child: const Text('Hi!'),
        );
      }
    ),
  );
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687Famm3lNGKm.png)

#### 2. 自定義元件 HomePageButton

自定義新的 Widget，可能是 StatelessWidget 或 StatefulWidget，透過 `build(context)` 提供的 context 來使用。

``` dart
@override
Widget build(BuildContext context) {
  return const Scaffold(
    body: HomePageButton(),
  );
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687ktFnFixYl6.png)

> 提醒：在開發 UI 時，需確保 `context` 的位置和來源，準確使用而不要越層級存取

![](https://ithelp.ithome.com.tw/upload/images/20230919/20120687TK9tPctbBQ.png)  
by Daria Orlova

------------------------------------------------------------------------

個人建議 Flutter 開發者都能了解 `BuildContext` 和 `Element`，盡可能地熟悉它，知道相關運作原理以及生命週期。它們能在狀態管理的主題上給予非常大的幫助，當發生錯誤時，我們能在第一時間有個概念與想法，才不會發呆不知道如何是好，可以更快且有效地解決問題。

`Element` 是 Flutter 高效的原因，請盡可能與它保持友善互動。相信很多人跟我一樣，都是看了很多文章、學習每位開發者的理解，再搭配 source code 閱讀，才能越來越熟悉它。總之，投資在這上面是很值得的一件事，當我們能正確使用它的時候，實現高效且高品質的產品就不會很困難了。

------------------------------------------------------------------------

## 延伸閱讀

[Day 3: 最熟悉的朋友 Flutter Widget，你會用但真的了解它嗎？](https://ithelp.ithome.com.tw/articles/10321643)

## Day 5: Flutter 的 StatefulWidget 和 State 生命週期，先熟悉它們再開發吧！

- 發布時間：2023-09-20 20:24:14
- 原文連結：<https://ithelp.ithome.com.tw/articles/10321406>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 5 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687sJRVlS9wwg.png)

生命週期在大部分的軟體開發中都會了解這個名詞，簡單來說就是某個東西從出現到消失，中間的每個階段都會有一個對應的狀態，那為什麼要有狀態？這些狀態都是為了讓開發者在特定情境下去針對應用程式、物件、UI 或是進行合適的操作，例如：在一開始的時候，我們需要將某些服務啟動或是給予屬性初始值，準備待會使用; 在初始化後的第二階段，可以開始進行資料的操作，可能是請求資料，也可能是數據處理; 最後在被銷毀，準備死亡的階段，可以進行資源的釋放，防止記憶體洩漏，讓整體效能提升。開發者在對的時間做對的事，告訴 APP 該怎麼運行和顯示，確保使用者擁有好的體驗，以及 APP 能流暢的呈現，這些都是我們的職責。所以生命週期對於 Mobile 開發來說非常重要，是不可忽視的一環。

大家都知道 Flutter 中有 StatelessWidget 和 StatefulWidget，而 StatefulWidget 因為需要長期保持狀態，會需要透過 State 去維護，它本身是託管在 Element 底下，也因為成本高的關係不適合重複創建。Flutter Framework 讓 Element 以及 State 可以在不同情境下觸發一些介面，讓我們能即時針對當前的 Widget 或是資源去進行處理，而在 State 中就有比較多環節我們需要注意，以下就跟著我來了解它們。

------------------------------------------------------------------------

## StatefulWidget Lifecycle Diagram

![](https://ithelp.ithome.com.tw/upload/images/20230920/20120687RhU9Z0zxuE.png)

#### Combine State LifeCycle

![](https://ithelp.ithome.com.tw/upload/images/20230920/20120687Og98UMEpG3.png)

## createState()

- Widget 初次創建時，同時會創建一個 **State**，負責在接下來記錄所有狀態
- 詳細過程
  1.  StatefulWidget 呼叫 `createElement()`，創建 StatefulElement 同時注入 Widget  
      ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687zWMIdYmvlv.png)
  2.  在建構子由 Widget 呼叫 `createState()` 創建新的 State，並由 Element 記錄下來
  3.  最後再將此 Widget 更新到 state 身上的 widget 屬性  
      ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687nG5rwJJphr.png)

## initState()

- Widget 創建後的初始化(只會呼叫一次)，此時 State 狀態為 `created`
- 狀態轉變的過程，首先調用 `super.initState()`，接著 StateLifecycle 會轉變為 `initialized`，並呼叫 `didChangeDependencies()`
- 可在這裡進行其他服務的初始化，例如 Animation、Controller 等等
- 提醒：避免在函式裡使用 InheritedWidget 和 Provider 的 context 存取，因為有可能依賴物更新後不會被通知要更新，請確保 MediaQuery.of(context) 這類的操作放置在 `didChangeDependencies()` 、`build()` 等等其他位置

State 生命週期包含 4 個部分，包含 `created`、`initialized`、`ready`、`defunct`。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687NPtMf5Y0z3.png)

## didChangeDependencies()

- State 狀態爲 `initialized`
- 觸發後裡面只有做了一件事，就是 `markNeedsBuild()`，也就是我們使用 `setState()` 做的事情，進行多層的生命週期與狀態檢查後，標記此元件對應的 element 為 **dirty**，並添加到 \_dirtyElements 這個清單，等候待會下一幀進行 rebuild
- 直接幫大家歸納幾個關鍵的觸發原因
  1.  元件初次執行 `createElement()` 的時候被 `mount` 綁定到樹上，這時候就會調用
  2.  依賴的 InheritedWidget 產生變化、有更新。例如：Theme.of(context)、Locale.of(context) 等發生變化時，依賴元件的 `didChangeDependencies()` 方法將會被調用
  3.  父元件的階層改變
  4.  元件本身的 Type 與 Key 改變  
      ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687YLcdcuTQG1.png)  
      ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687el58t4GwR5.png)

## didUpdateWidget()

- 可以在此檢查新舊元件、屬性是否不同，根據不同條件進行服務的重置，或是調整某個狀態。例如：在 `didUpdateWidget()` 中取消 Old Widget 訂閱的 callback，並讓 New Widgets 訂閱 callback
- 透過 Widget.`canUpdate()` 來檢查 Widget Tree 中同一位置的新舊節點，決定是否要更新，如果返回 true，代表新舊元件的 `key` 和 `runtimeType` 都相同，就會觸發`didUpdateWidget()`。使用新 Widget 配置更新原本的 Element 配置; 反之如果返回 false 則創建新的 Element
- 幾個常見場景
  1.  本身進行 hot reload，在 `ressemble()` 後會觸發 `didUpdateWidget()`
  2.  父元件執行 `setState()` 或其他會執行 `build()` 的操作，父元件不會觸發 didUpdateWidget()，而子元件 `didUpdateWidget()` 會被觸發
- 提醒：`setState()` 在這使用會沒有作用，因為 didUpdateWidget() 執行完後就會執行 `rebuild()`，也就是 State 的 `build()`  
  ![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687qJmfvOxJvo.png)

## reassemble()

- 為了 debug 開發使用，在執行 Hot Reload 後呼叫
- release 模式下會被忽略，不會使用
- 執行順序
  1.  `reassemble()`
  2.  `didUpdateWidget()`
  3.  `build()`

針對當前元件執行 `markNeedsBuild()`，觸發 `build()` 進行 rebuild，接著同時針對所有的 child 都執行 `reassemble()`。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687nyYI1Ckos3.png)

## build()

- State 狀態爲 `ready`
- 最熟悉的部分，也就是創建 Widget 內容、整個 Widget Tree，或是更新
- 大部分操作都會影響 build()，通常前面執行了 `didChangeDependencies()`、`didUpdateWidget()`，或是我們手動執行 `setState()`，都會觸發它

底層是 Element 會執行 `performRebuild()`，接著觸發 StatelessWidget-build() 或是 State.build() 創建 Widget Tree，並將 element 本身的 dirty 屬性設為 false，代表乾淨了、更新完成，最後在使用 `updateChild()` 進行 child 刷新。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687AclcxRIB8Z.png)

## deactivate()

- 當 Widget 從 `Widget Tree` 中被移出後呼叫，移出後會等待重新添加到 `Widget Tree`，可能會在當前幀更改完成之前重新插入樹中，如果未被插入到其他節點時，則會繼續執行 `dispose()`
- 重新插入其他樹中，可以通過 **GlobalKey** 來實現，Widget 從這顆樹移動到另一顆樹，或是移動到其他的階層位置，這個技巧稱為 **Tree Sugery**，其中還包含對應的兩個好夥伴 Element 以及 RenderObject

看 Code 部分，同時在這裡也會將此元件原本有依賴的 InheritedWidget 都拿出來，以迴圈的方式，將此 Widget 從他們的依賴者名單中移除，也就代表之後的更新不會再通知我了。最後將 Element 生命週期設為 **inactive**。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687qqv4fHFLB2.png)

## dispose()

- State 狀態爲 `defunct`
- 將 Widget 永久銷毀，包含 Element 和 Render Object，釋放資源
- `context.mounted` 屬性會被設置為false，也代表生命週期的結束，所以不能在此執行 `setState()`
- 其中 `super.dispose()` 應該作為 Widget-dispose 的最後一個執行函式，資源釋放需要在之前執行，如果在後面則不會處理
- 提醒，在元件使用到的資源記得要釋放掉，否則會造成記憶體洩漏。例如：**TextEditingController**、**AnimationController**、**Ticker**、**Stream** 等等

元件的 Element 會執行 unmount()，從樹上拔除，並將元件和相關依賴資源釋放，然後生命週期從 inactive 轉變為 defunct，這個時候 State 生命週期也會轉變為 defunct 狀態。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687oAoYJ74wqs.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687UWIrHZLL9z.png)

## mounted & context.mounted

- 用來檢查 Element 是否存在，是否還在 Element Tree，還在的話代表我們可以繼續存取 context 物件以及它的屬性
- 這裡使用到的 context 本身是 `BuildContext` ，它也是 Element 的介面，實際上就是 Element，也代表這個 Widget 在樹中的位置
- 常見用法，通常我們進行在非同步操作後，需要透過它檢查是否綁定，接著才能進行 `setState()`，或是其他 context 操作

可以看到源碼，很簡單的就是檢查 element 是否為 null。可以由註解得知，同時也是在檢查 State 物件是否還存在。最後一行也提到，避免在 `mounted` 為 false 的時候執行 `setState()`，不然就會報錯。

如果專案有使用 **flutter_lints** 套件保護代碼品質的話，它本身也有提供相對的規則來幫我們檢查是否有在非同步操作後直接使用 context。也提醒大家 Linting Tool 代碼分析是很重要的哦。  
![](https://ithelp.ithome.com.tw/upload/images/20230918/20120687MfOgR6C2Tc.png)

------------------------------------------------------------------------

在 Flutter 中關於生命週期這件事，Element 是核心角色，它掌管著 Widget 和 State、RenderObject 更新，建議開發者可以去了解他們，或是跟著我解析 Source Code，當我們越熟悉也代表越了解 Flutter 以及 APP 是如何運作，開發過程中會更有感覺喔！

------------------------------------------------------------------------

## 延伸閱讀

[Day 6: 完全掌握 Flutter APP 生命週期，跟著我從源碼認識它！](https://ithelp.ithome.com.tw/articles/10324112)

## Day 6: 完全掌握 Flutter APP 生命週期，跟著我從源碼認識它！

- 發布時間：2023-09-21 20:38:32
- 原文連結：<https://ithelp.ithome.com.tw/articles/10324112>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 6 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687KP99lP7QnV.png)

到了生命週期第二篇，開發者不僅要了解 StatefulWidget 的生命週期，很常也會需要現在 APP 的週期狀態，而在 8/17 剛發布的 Flutter 3.13 改版，新增了 **AppLifecycleListener** api，讓我們更完整的掌控生命週期，而且多了幾種狀態，讓開發者能夠更精準的處理每個情境。常見的情境，包含我們在做一些 Socket 通訊的應用，即時在用戶到背景的時候失去連線，或是遊戲玩到一半返回桌面需要先暫停。在每個狀態下即時進行一些相對應的措施，讓使用者有一個良好的體驗。本文中會跟大家說明監聽生命週期的所有方式(新舊方法)，特別是 **AppLifecycleListener** 類別。

------------------------------------------------------------------------

## AppLifecycleListener

從字面上來看 AppLifecycleListener 就是負責監聽 APP 生命週期，而它跟我們常用的 `didChangeAppLifecycleState()` 不同地方就是能掌握的情境更多，先說明一下 APP 所有狀態

1.  `resumed` → 在裝置前景
2.  `inactive` → 剛退出螢幕前景
3.  `hidden` → 隱藏內容
4.  `paused` → 退到裝置背景
5.  `detached` → APP 被銷毀、釋放

#### resumed

- 在前景運行，通常手機正在顯示 APP 畫面
- 可以跟使用者互動

#### inactive

- 非活動狀態
- 在前景時插入其他應用，切到手機的APP選擇頁、子母畫面、電話、下滑的控制中心、系統視窗訊息等等，接著就是進入 `hidden` 狀態
- 此狀態等於 Android.onPause()

#### hidden

- 即將進入背景時的過渡階段

#### paused

- 在背景運行
- 無法跟使用者互動，也是非活動狀態
- 此狀態等於 Android.onStop()

#### detached

- 一開始與結束的停止狀態
- 一旦從 Platform 收到第一個生命週期更新，就會更新到當前狀態
- 實際情況：APP被關閉清除

------------------------------------------------------------------------

知道 APP 五大狀態後，接下來要了解狀態轉變過程中會觸發哪些情境也就是程式裡的 callback，總共有八種，我們需要了解從 APP 啟動到被銷毀的過程以及從背景回到前景過程。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687R6oLRWnCD8.png)

### APP開啟到停止運作

1.  state: detached
2.  `onStart()`
3.  state: resumed
4.  `onInactive()`
5.  state: inactive
6.  `onHide()`
7.  state: hidden
8.  `onPause()`
9.  state: paused
10. `onDetach()`
11. state: detached

### APP背景回到前景

1.  state: paused
2.  `onRestart()`
3.  state: hidden
4.  `onShow()`
5.  state: inactive
6.  `onResume()`
7.  state: resumed

提醒：onPause()、onDetach()、onRestart() 這三種狀況只會出現在 **iOS** 和 **Android** 裝置

有人看到這裡可能會問說，有沒有任何狀態改變都能捕捉的 callback？當然有呀！這時候我們可以使用 `onStateChange()`，除了個別狀態的 callback 會被觸發以外這個方法每次都會被觸發，讓我們在開發時可以進行不同處理。文章後面會有實際開發方式

------------------------------------------------------------------------

取得當前 APP 狀態可以使用幾個方式 ，可以通過創建新的 `AppLifecycleListener` 或通過覆寫 `WidgetsBindingObserver.didChangeAppLifecycleState` 也能經由`SchedulerBinding.instance.lifecycleState` 來查看當前的APP狀態，有幾種方式能存取我們要的資料。

### 取得當前狀態

可以使用 `SchedulerBinding.instance.lifecycleState`，本身是 nullable，所以存取前記得檢查是否為空值。

``` dart
@override
void initState() {
    super.initState();

    _state = SchedulerBinding.instance.lifecycleState;
    if (_state != null) {
        debugPrint(_state!.name);
    }
}
```

### 監聽全部狀態

這件事很簡單，只需幾個步驟即可，首先我們要在 StatefulWidget 的 State 上去 with `WidgetsBindingObserver` 這個 mixin class，透過它我們才能進行 APP 狀態監聽。

``` dart
class _MyHomePageState extends State<MyHomePage> with WidgetsBindingObserver {
    ...
}
```

那我們如何透過 WidgetsBindingObserver 去監聽呢，首先我們需要透過 `addObserver()` 去註冊這個 State 為監聽者，當有週期變化的時候才會通知我們。

WidgetsBinding 本身是一個 Flutter Framework 和 Flutter Engine 層溝通的橋樑，其中針對 SchedulerBinding(安排任務)、GestureBinding(手勢操作)、RendererBinding(渲染操作)等等都是它服務的對象。而在這過程中如何做到通知呢？核心都會使用到 InheritedWidget 去執行狀態更新。

1.  在 State 裡的 `initState()`，也就是一開始的時候進行觀察者註冊

``` dart
@override
void initState() {
    super.initState();
    
    WidgetsBinding.instance.addObserver(this);
}
```

2.  在 State 裡的 `dispose()`，在銷毀的時候進行觀察者釋放，讓記憶體有效使用

``` dart
@override
void dispose() {
    WidgetsBinding.instance.removeObserver(this);

    super.dispose();
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687S5R0bTcRPk.png)

3.  覆寫 `didChangeAppLifecycleState()`，監聽 APP 的五種狀態，在 Flutter 3.13 更新後多了 `hidden` 狀態

``` dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);

    if (state == AppLifecycleState.resumed) {

    } else if (state == AppLifecycleState.inactive) {

    } else if (state == AppLifecycleState.hidden) {
  
    } else if (state == AppLifecycleState.paused) {

    } else if (state == AppLifecycleState.detached) {

    }
}
```

你以為這樣就結束了嗎？當然還沒，我們來了解一下底層做了哪些事。

在 APP 一開始 Flutter Engine 會透過 `_updateInitialLifecycleState()` 進行初始狀態的通知，接著 ServiceBinding 裡的 `readInitialLifecycleStateFromNativeWindow()` 會使用 `_handleLifecycleMessage()` 處理來自平台的初始狀態。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/201206875qB75N1y5C.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687WP3vKuNXCf.png)

一開始會解析狀態字串，將從 Flutter Engine 拿到的字串轉成我們熟悉的 **AppLifecycleState** enum (看到這裡就想到可以使用 Dart3 的 switch expression 來優化一下XD)。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687ynb601XUdD.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687iMNMj9jqBg.png)

接著使用 `_generateStateTransitions()` 計算上一個狀態跟當前狀態的差異，返回一個 AppLifecycleState List，實際上有可能是 resume 到 paused，過程就會包含 inactive 跟 hidden。圖中紅線為重點部分，如果是 paused 到 detached 就不需要計算，直接回傳有 detached 狀態的 List。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687tTQROALZEo.png)

取得改變的狀態清單後，呼叫 SchedulerBinding 裡的 `handleAppLifecycleStateChanged()`，在背景針對狀態做一些處理，同時通知有訂閱的 Observer，也就是 State 裡我們使用的 `didChangeAppLifecycleState()`。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687f3RKTWnqjy.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687x6al5i2Yc4.png)

同時可以看到針對 `inactive` 狀態，在 APP 不活躍不可互動的時候，會呼叫 `setFramesEnabledState()` 更新 framesEnabled 為 false，也就代表現在不用再執行渲染了，暫停工作，節省手機電量。反之當 App 為 `resume` 狀態的時候，回來前景了，這時候繼續執行 `scheduleFrame()` 開始後續的渲染工作。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687HF7bHhdiSp.png)

後續每當 APP 生命週期有變動的時候，在 ServicesBinding 裡都會透過 `_handleLifecycleMessage()` handler 進行接收，一樣會先將狀態字串轉換成 AppLifecycleState，最後傳遞給每個觀察者 observer，我們的 `didChangeAppLifecycleState()` 就會一直被通知，我們就能做一些對應的動作囉。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/201206874Pb3qOoAsO.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687SfBqZw4a2I.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687krMQBhqDn3.png)

以下方的例子，就是當 APP 到背景的時候印出訊息，而當回到前景的時候顯示 Snack message。很多的情境都會使用到，可以發通知提醒使用者，或是有使用藍牙服務的話，可以即時暫停掃描。

``` dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    if (state == AppLifecycleState.resumed) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('App resumed.')));
    } else if (state == AppLifecycleState.inactive) {
    } else if (state == AppLifecycleState.hidden) {
    } else if (state == AppLifecycleState.paused) {
        debugPrint('App paused.');
    } else if (state == AppLifecycleState.detached) {}
}
```

### AppLifecycleListener 監聽狀態更新過程的所有情境 (新方式)

創建 AppLifecycleListener 實例，不需要跟以前一樣在 State 裡 mixin WidgetsBindingObserver 在元件創建的 `initState()` 進行監聽，最後再銷毀 `dispose()` 的時候釋放資源。這個動作很重要，記得不要忘記，否則會造成記憶體洩漏哦。

``` dart
@override
void initState() {
    super.initState();

    _listener = AppLifecycleListener(
        onShow: () => _handleTransition('show'),
        onResume: () => _handleTransition('resume'),
        onHide: () => _handleTransition('hide'),
        onInactive: () => _handleTransition('inactive'),
        onPause: () => _handleTransition('pause'),
        onDetach: () => _handleTransition('detach'),
        onRestart: () => _handleTransition('restart'),
        onStateChange: _handleStateChange,
    );
}

void _handleTransition(String name) {
    debugPrint(name)
}

void _handleStateChange(AppLifecycleState state) {
    // do something
}

@override
void dispose() {
    _listener.dispose();

    super.dispose();
}
```

一樣源碼環節，直接深入 **AppLifecycleListener** 這個類別，可以看到跟 State 一樣 with **WidgetsBindingObserver**，進行 observer 監聽，它包了一層，並暴露一些實用的 API。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687IVzZFWZMkZ.png)

主要在 `didChangeAppLifecycleState()` 監聽到狀態的時候，做了很多檢查還有觸發 callback，判斷上一個狀態跟當前狀態的差異，得知現在的場景，而不管怎麼樣都會觸發 `onStateChange.call()`。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687QUaBrHQXep.png)

### 監聽 APP 退出時的請求

使用 `onExitRequested()` 可監聽 APP 退出時的請求，決定是否要讓 APP 關閉退出。

我們使用以下的官方範例來理解，可以創建一個 callback 接收事件，再被觸發的時候回傳 AppExitResponse，當有退出請求的時候我們可以告訴它是否允許退出，或是取消這請求。

``` dart
@override
void initState() {
    super.initState();

    _listener = AppLifecycleListener(
        onExitRequested: _handleExitRequest,
    );
}

Future<AppExitResponse> _handleExitRequest() async {
    final AppExitResponse response =
        _shouldExit ? AppExitResponse.exit : AppExitResponse.cancel;
     
    debugPrint(response.name);

    return response;
}

Future<void> _quit() async {
    final AppExitType exitType =
        _shouldExit ? AppExitType.required : AppExitType.cancelable;

    await ServicesBinding.instance.exitApplication(exitType);
}
```

**AppExitResponse** 擁有兩個類型

1.  `exit` → 允許 APP 退出
2.  `cancel` → 禁止退出 APP  
    ![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687o6T5jDD4S0.png)

quit() 用來關閉運行中的 APP，執行 `ServicesBinding.instance.exitApplication(exitType)` 方法，其中參數是 AppExitType，一樣擁有兩個 type

1.  `required` → 允許 APP 退出
2.  `cancelable` → 禁止退出 APP  
    ![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687tSbJ8QD5UJ.png)

當我們使用 ServicesBinding 的 `exitApplication()` 時會檢查是否有覆寫 `onExitRequested()`，沒有的話會直接回傳 `AppExitResponse.exit`，有的話會確認自定義的回應，接下來會檢查 AppExitResponse type 和 AppExitType type，總共有三種情況：

1.  如果在預設沒有覆寫的情況下，就會自然關閉 APP
2.  如果 AppExitResponse \*\*\*\*和 \*\*\*\*AppExitType \*\*\*\*其中有一個是允許退出的話，APP 就會執行關閉
3.  只有在兩個都是 cancel 語義的情況下 APP 才不會退出

透過 ServicesBinding 的 `exitApplication()` 使用 `SystemChannels` 將 Flutter Engine 關閉並呼叫 Platform 的 exit API。

> `exitApplication()` 與 `exit()` 方法不同的是，它讓 Engine 有機會清理資源，以便在退出時不會崩潰，建議使用此方式退出 APP。

![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687L202UrPb8L.png)

這時侯會從原生 Platform 取得 `System.requestAppExit` 事件，同時使用 `handleRequestAppExit()` 取得 AppExitResponse，它本身預設為 exit type，但我們有覆寫 `didRequestAppExit()` 也就是在 Widget-State 裡的 onExitRequested callback，看我們給予什麼 AppExitResponse  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687yCO1URJdJl.png)

`handleRequestAppExit()` 裡面的邏輯是只要有一個 observer 是設置 **AppExitResponse.cancel**，也就是取消關閉，APP 就不會被關閉。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687cF5h2XSq5q.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230921/20120687NYirKAPJXr.png)

最後檢查 result Map 裡的 `response` 欄位，如果是 cancel 就繼續運行，exit 或沒有東西就會將 APP 關閉。  
![](https://ithelp.ithome.com.tw/upload/images/20230921/201206877H8M7GeAUC.png)

官方提醒：不要在 `onExitRequested()` 儲存重要數據，可能會錯誤和失敗。APP 本身可以通過很多種方式退出，而且不會提前告知，例如：拔掉電源、取出電池、任務管理器或使用 command line 終止。

------------------------------------------------------------------------

本文篇幅稍微有點長，主要想告知大家生命週期的重要性，熟悉它是每個開發者都需要做的事，能有效理解 APP 如何運作，在對的時間做對的處理。而新推出的 `AppLifecycleListener`，讓我們可以監聽到狀態的轉換過程，相信對實際開發上一定會有所幫助。花一些時間了解它是很值得的哦！

------------------------------------------------------------------------

## 延伸閱讀

[Day 5: Flutter 的 StatefulWidget 和 State 生命週期，先熟悉它們再開發吧！](https://ithelp.ithome.com.tw/articles/10321406)

## Day 7: MediaQuery 是什麼？很方便但如何正確在 Flutter 使用，順便跟你說它的缺點

- 發布時間：2023-09-22 20:08:41
- 原文連結：<https://ithelp.ithome.com.tw/articles/10325095>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 7 篇

![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687sORvwGm76B.png)

所有的 Flutter 開發者應該多多少少都有碰過 **MediaQuery**，它給予的支援很廣，是個很重要的數據來源，以至於非常多場景都會需要存取它。而在 Flutter 3.10 改版後，**MediaQuery** 有進行優化，算是一個重要的更新，但就我了解很多開發者不清楚，可能因為官方沒有在發布上進行說明。它多了新的撰寫方式和存取資料的方式，本文會帶大家了解新舊用法的差異，以及深入內部了解細部程式碼，讓我們更熟悉它。

------------------------------------------------------------------------

那我們在進入主題之前可能需要先幫 `InheritedWidget` 做個簡單的說明，讓大家複習一下。因為 MediaQuery 本身繼承 `InheritedWidget` 類別。它的主要職責是**共享數據**，而其他元件存取數據的限制是必須在相同 Widget Tree 底下，也是相同 Element Tree，透過 Element 訂閱並接收資料，所以不同樹狀結構下就會拿不到東西。上面有講到訂閱這個關鍵字，實際上 `InheritedWidget` 內部互動長什麼樣子呢，我們稍微講解一下。

以下面範例來說，我們通常在自定義一個 InheritedWidget 的時候大概會是這個樣子，其中有一個 data 屬性，對應的 AppData 是我在這個 APP 要共享的資料，接下來元件在使用時會透過 `of(context)` 靜態方法來訂閱並存取這包資料，訂閱的意思就是在 AppData 有任何更新的時候要通知元件，這時候可以進行一些 UI 變化。主要透過 `dependOnInheritedWidgetOfExactType()` 方法進行監聽，以字面來說就是要依賴這個資料。底下再覆寫 `updateShouldNotify()`，撰寫需要通知的條件，正常就是判斷兩個新舊的 AppData 是否一樣，不同的話就通知訂閱者也就是元件，讓他們可以做後續處理。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687pPd3HeiUrG.png)

回到主題 MediaQuery，它本身也是繼承 `InheritedWidget`，數據來源為 `MediaQueryData`，在內部一樣是 data 屬性，而 MediaQueryData 擁有 18 個屬性資料，都是跟 APP 和裝置相關的資料，包含 **size** 長寬大小、**orientation** 裝置方向、**textScaleFactor** 文字大小、**platformBrightness** 裝置顯示模式等等，都是很多情境上會影響畫面的數據。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687QciqFjJ1uz.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687J52x3qv5MB.png)

## 存取 MediaQuery 的方式

接下來看一下最常存取 MediaQuery 的方式，它雖然很方便但也是個性能炸彈，我們逐步來了解。此範例擁有三個頁面，HomePage、SecondPage 以及 ThirdPage。

1.  首先我在 HomePage 使用 `MediaQuery.of(context)` 靜態方法取得整包資料，然後拿 size 長寬出來使用，可能是有元件需要根據長寬來做一些佈局調整或是單純想了解。
2.  SecondPage 我一樣使用 `MediaQuery.of(context)` 取得 **platformBrightness** 屬性，可以得知目前裝置是 Light mode 還是 Dark mode，接著把它印出來
3.  第三個頁面 ThirdPage 沒有使用 MediaQuery，不同的是使用了一個 TextField 輸入框，可以讓用戶輸入一些資料，屬於很正常的場景  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687PVRWwyc2RD.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687kFnEY8kOYg.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/201206876aI9YLnLT4.png)

我們實際來看看運行後 APP 會出現什麼狀況，左邊是 Console，右邊是運行的模擬器，整個流程就是開啟到第三頁，模擬使用者打開鍵盤要輸入一些資料。從 GIF 展示可以發現，在執行鍵盤操作的時候會其他兩個頁面都會受到影響，不停的進行 rebuild，但是它們實際上沒有顯示在螢幕上，造成不必要的性能消耗。

主要原因是打開和關閉鍵盤的時候，裝置的 padding 屬性會持續改變，它也是 MediaQueryData 的一員，當更新後就會經由 `updateShouldNotify()` 檢查資料，最終通知所有的依賴者進行 rebuild。  
![gif](https://i.imgur.com/g1G8ApA.gif)

> 實際上配置沒有更新的元件都不會進行繪製 repaint，節省消耗成本，不過還是要盡量保持 Widget 的拆分，讓受影響的部分減少

## 源碼分析

接下來看一下源碼，讓我們更了解它。以下是流程，首先提供 Element 繼承關係圖，讓大家更容易了解 Code 的運作：  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687DBZTXOdg8z.png)

1.  在收到資料更新後，InheritedWidget 對應的 InheritedElement 的 `updated()` 會被觸發，檢查我們覆寫的 `updateShouldNotify()` 是否條件符合，true 的話就執行父類(ProxyElement)的 `super.updated()` 方法  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687Lg5P10RsGR.png)

2.  檢查新舊元件後，執行 `updated()` 和 `rebuild()`，兩個主角。`updated()` 是要通知所有元件的 Element 有更新了請注意。過程中會呼叫 `notifyClients()`，使用迴圈取得每個 dependant 物件(這邊的命名方式個人覺得還可以更好，實際上它是 Element)，個別使用 `notifyDependent()` 方法通知  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687b9X2vov6vM.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687heveoZSld8.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687uzScBHpPnd.png)

前面會先確定每個 Element 是否有依賴數據，有的話會呼叫 Element 的 `didChangeDependencies()` 方法，以 StatefulWidget 的 StatefulElement 來說，裡面就是更新 `_didChangeDependencies` 屬性為 true，代表接下來允許觸發 State 的 `didChangeDependencies()` 方法。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687UFSdNNnJuZ.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687nkSFBGUPru.png)

3.  `rebuild()` 環節裡面會先驗證 Element 狀態是否為 **active**，代表還在樹上，可以進行後續處理，這時候在呼叫 `performRebuild()`，讓元件開始進行 rebuild 工作。  
    ![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687vumEX9G4Kc.png)

一樣以 HomePage(StatefuleWidget) 來說就是跟 StatefulElement 互動，檢查 `_didChangeDependencies` 屬性是否為 true，是否有依賴的資料更新了，有的話就觸發 State 裡我們在使用的 `didChangeDependencies()`，接著在尾巴呼叫呼叫父類 ComponentElement 的 `performRebuild()`。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687jrMH8ytPzO.png)

到了 ComponentElement 的 `performRebuild()`，主要進行 State 的 `build()` 重建 WidgetTree，最後再將 dirty 屬性從 true 改成 false，代表 Element 和 Widget 都已經刷新了，完成工作。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687K0wwJe8iWV.png)

最後會先觸發 `didChangeDependencies()` 在觸發 `build()`，是不是跟我們熟知的生命週期一樣呢！  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687fHNkDBZqqf.png)

## 正確用法

StatefulWidget 需要更改存取 MediaQueryData 的地方，在 `didChangeDependencies()` 存取，我們只需要在數據有更新的時候拿到最新資料，更新後交給後面的 `build()` 去使用。避免直接在 `build()` 使用 `MediaQuery.of(context)` 方法，才不會所有的 rebuild 都一直重新呼叫 ，造成不必要的運行成本。  
![](https://ithelp.ithome.com.tw/upload/images/20230922/20120687guIE3H2TEH.png)

------------------------------------------------------------------------

本文舉鍵盤操作的案例只是為了示範，很多操作都會更新 MediaQueryData，所以需要謹慎使用 `MediaQuery.of(context)` 方法，想看看今天疊了5個頁面以上，造成的影響會更多，甚至有可能使用者體驗會下降，而且以上只是因為 padding 屬性的變動，如果有其他沒有使用到的屬性更新了，每個訂閱者都會慘遭波及，這場景應該不太好對吧？

那現在我們怎麼優化這部分呢？要感謝 Flutter 3.10 發布的改版優化，讓我們可以做到指定依賴，詳細我們下一篇討論吧！

------------------------------------------------------------------------

## 延伸閱讀

[Day 8: MediaQuery 優化後與 InheritedModel 如何進行指定更新](https://ithelp.ithome.com.tw/articles/10325740)

## Day 8: MediaQuery 優化後與 InheritedModel 如何進行指定更新

- 發布時間：2023-09-23 19:12:32
- 原文連結：<https://ithelp.ithome.com.tw/articles/10325740>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 8 篇

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687yx53qPafiN.png)

上一篇我們討論了 MediaQuery 是什麼、它的正常使用方式，並稍微帶大家分析背後源碼的運作流程。本文要了解在 Flutter 3.10 改版後，**InheritedWidget** 做了哪些改動，以及我們如何更高效的去存取 **MediaQueryData**，提升 APP 整體品質。

------------------------------------------------------------------------

我們在存取 MediaQueryData 時很常會使用 `MediaQuery.of(context)` 方法，進行整包資料的訂閱，並在有任意資料變動的時候收到通知，很容易造成不必要的 rebuild，影響 APP 性能與運行。

## Specific dependency 指定依賴

原本的 `MediaQuery.of(context)` 屬於依賴整包資料，有任更新都會收到通知。指定依賴就是我們可以只依賴我們需要的屬性就好，只有它更新的時候通知我就好，其他的我不需要理會，這個方式也比較符合我們大部分的開發場景。一開始先展示實際範例，讓大家能快速了解新的用法  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687qTgUcG5lfy.png)

``` dart
// 18種靜態方法，針對18個屬性
MediaQuery.sizeOf(context)
MediaQuery.orientationOf(context)
MediaQuery.devicePixelRatioOf(context)
MediaQuery.textScaleFactorOf(context)
MediaQuery.platformBrightnessOf(context)
MediaQuery.paddingOf(context)
MediaQuery.viewInsetsOf(context)
MediaQuery.systemGestureInsetsOf(context)
MediaQuery.viewPaddingOf(context)
MediaQuery.alwaysUse24HourFormatOf(context)
MediaQuery.accessibleNavigationOf(context)
MediaQuery.invertColorsOf(context)
MediaQuery.highContrastOf(context)
MediaQuery.disableAnimationsOf(context)
MediaQuery.boldTextOf(context)
MediaQuery.navigationModeOf(context)
MediaQuery.gestureSettingsOf(context)
MediaQuery.displayFeaturesOf(context)
```

此範例中 HomePage 在 `didChangeDependencies()` 裡使用 `MediaQuery.sizeOf(context)`，只有訂閱 size 屬性，需要再它有變化時通知我。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687bP8w5DjofQ.png)

ScondPage 一樣將寫法更改為 `MediaQuery.platformBrightnessOf(context)`，監聽 platformBrightness 屬性的變化，可以了解 APP 是否使用深色模式。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687A10dv630Hu.png)

最後跟上一篇文章一樣，我們在 ThirdPage 使用了 TextField 輸入框，讓使用者可以輸入文字。當鍵盤彈出和關閉時，會頻繁更新 MediaQueryData 裡的 **padding** 屬性，光打開就會更新 20 幾次。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687tQPgTmWnTf.png)

可以看到實際運行的狀況，前面的 HomePage 和 SecondPage 絲毫沒有受影響，因為它們本身是依賴 **size** 和 **platformBrightness** 屬性，不會因爲其他數值的更新而收到通知，也不會因此 rebuild。  
![gif](https://i.imgur.com/eucEFJy.gif)

在現在的 Flutter 版本，讓我們可以精準的去存取 MediaQueryData，進行指定依賴，原有專案也只需要簡單做個修改，整體性能就能有所提升，這個 MediaQuery 優化真的很重要。

------------------------------------------------------------------------

當然，不免俗的我們還是要進入源碼分析環節，了解實際上背後做了什麼改動，以及它的更新流程。以下稍微列出了幾個重點：

- `_MediaQueryAspect` → enum，需依賴的資料類型
- `inheritFrom({aspect})` → 幫 Widget 產生依賴，決定依賴全部屬性還是指定屬性
- `updateShouldNotifyDependent()` → 檢查資料是否異動，並通知依賴者

首先看到 MediaQuery 本身，會發現繼承的對象換了，是 `InheritedModel`，泛型待著一個 `_MediaQueryAspect`，InheritedModel 實際上繼承 InheritedWidget，也就是多封裝了一層，它存在的目的就是讓我們可以只依賴 Model 的一小部分。

另外我們也可以自定義 InheritedModel 跟 aspect enum，讓 InheritedModel 可以根據我們的依賴，僅通知跟 aspect 相關的元件進行更新  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687BAgleV0uB2.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687GiRhAc7qEy.png)

我們來看看 MediaQuery 使用到的 `_MediaQueryAspect`，單純是一個 enum，裡面的 type 對應 MediaQueryData 的18個屬性，讓我們可以區別實際上依賴哪個資料  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687y6I4Oy5hPJ.png)

先隨邊挑選一個靜態方法，來看它做了哪些事情，`sizeOf(context)` 實際上 call 了內部方法 `of(context, MediaQueryAspect.size)`，跟以前不同的是多了第二個參數，給予 size 這個 MediaQueryAspect enum。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687Nwmdn32wQg.png)

原有的 MediaQuery 使用方式 `of(context)`，裡面都是使用 `_of(context)` 內部方法，但就沒有給予 aspect type，因為它是監聽整個 MediaQueryData。

接下來可以看到重點部分 `InheritedModel.inheritFrom(context, aspect)`

1.  一開始先檢查 aspect 是否為 null，是的話就跟直接回傳 `dependOnInheritedWidgetOfExactType()`，依賴整包資料
2.  檢查 Element Tree 上的所有 InheritedElement，取得泛型為 MediaQuery 且有提供這個 aspect 資料的 InheritedElement list。使用 `_findModels()` 方法查找，接著會透過 `isSupportedAspect()` 檢查 Element 是否有提供
3.  取出最後一個拿到的 InheritedElement，接著透過 `dependOnInheritedElement()` 取得對應的 InheritedWidget，也就是 MediaQuery  
    ![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687ehDtMI2ksG.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687Iu3vyuOTdk.png)

到這裡我們已經了解大概的依賴流程，那資料更新時如何通知呢？就需要看另一個重要環節 `updateShouldNotifyDependent(oldWidget, dependencies)`，當 MediaQueryData 其中有一個屬性有變動後就會檢查每個有依賴這些資料的 Element，看他們跟現在變動的數據是否有依賴關係，這時候會呼叫 `updateShouldNotifyDependent()` 進行檢查。它本身有兩個參數，第一個是舊的 MediaQuery，第二個是那些有變動的 aspect type 資料。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687oN3I4EuF1g.png)

一開始針對這些變動資料執行迴圈，根據每個 `_MediaQueryAspect` type 檢查原本的屬性值跟新的屬性值是否不一樣，不一樣代表有變化，所以返回 true，通知依賴者、元件的 Element 要執行更新任務，呼叫 `didChangeDependencies()`。  
![](https://ithelp.ithome.com.tw/upload/images/20230923/20120687ETzDyB5pa0.png)  
最後 State 的 `.didChangeDependencies()` 和 `build()` 就會陸續被觸發，進行 rebuild。

------------------------------------------------------------------------

MediaQueryData 整個的依賴、更新流程就是這樣，是不是慢慢的看過後會更熟悉它，實際上也沒有非常複雜的邏輯去處理。當懂原理後，在往後的開發會知道如何去思考作法，讓一切都在自己的掌控範圍，整個過程也會更有意思。

------------------------------------------------------------------------

## 延伸閱讀

[Day 7: MediaQuery 是什麼？很方便但如何正確在 Flutter 使用，順便跟你說它的缺點](https://ithelp.ithome.com.tw/articles/10325095)

## Day 9: 深入 setState()，觀察它如何進行 UI 刷新！

- 發布時間：2023-09-24 18:29:15
- 原文連結：<https://ithelp.ithome.com.tw/articles/10326495>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 9 篇

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687p2HQD6OA4w.png)

每次執行 `flutter create <name>` 創建新的專案後，預設都會在主頁面看到很熟悉的計數器功能，在點擊 FloatingActionButton 後會執行 \_incrementCounter() 方法，裡面使用了 `setState()` 方法，並在第一個參數使用匿名 callback，讓開發者將一些狀態放在區塊內更新，接著頁面、元件就會在下一幀刷新並進行 rebuild，顯示新的畫面跟效果給使用者。  
![](https://ithelp.ithome.com.tw/upload/images/20230924/2012068750F88iqiF0.png)

當 `setState()` 呼叫後，根據 StatefulWidget 的生命週期，就會在執行一次 `build()`，讓整個 Widget Tree 可以根據新的狀態、配置去顯示。

> 有關 LifeCycle 的部分可以去閱讀另一篇文章  
> [Day 5: Flutter 的 StatefulWidget 和 State 生命週期，先熟悉它們再開發吧！](https://ithelp.ithome.com.tw/articles/10321406)

![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687db3x6FKfUb.png)

- 主要透過 Element 呼叫了 `markNeedsBuild()`，進行重新 rebuild
- 神奇的魔法，實際上不管變動的狀態是否有放在 callback 裡面，整棵樹都會被重置。如果將狀態或一些操作寫在 callback 裡面，就要確保不能有非同步操作，也就是 Future 回傳值

> 建議：將需要更新的狀態操作放在 callback，其他則在方法外面，提高整體可讀性

``` jsx
setState(() {
    _counter = _counter + 1;
});

// or

_counter = _counter + 1;
setState(() {});
```

提醒一下，在 `setState()` 或是 `context` 操作之前如果有進行非同步操作，記得呼叫時要先檢查 `mounted` 屬性，確認 Widget 與 Element 都有在樹上，才能確保後續的 rebuild 刷新，否則如果剛好 Widget 銷毀了或是進行樹上的移動，這時就會報錯，記得保持好習慣哦。有使用 **flutter_lint** 通常會出現 `use_build_context_synchronously` 提醒，以下是範例：

``` dart
Future<void> _incrementCounter() async {
  await Future.delayed(const Duration(seconds: 1));

  if (!mounted) {
    return;
  }

  setState(() {
    _counter++;
  });
}
```

#### 其實

當初為 Flutter 開發人員做了 UX 的研究，原本只有一個 `markNeedsBuild()` 的時候，發現大家把它當成保命符，在不確定的情況下都會呼叫它，導致濫用的情況。後來改成同步的 `setState()` 後，大家開始謹慎使用了，發生問題的機率也變小了。 本身 `setState()` 是一個跟心理層面影響的 API。

以下是相關資訊：

- <https://github.com/flutter/flutter/issues/12296>
- <https://stackoverflow.com/questions/44379366/why-does-setstate-take-a-closure/44379367#44379367>

------------------------------------------------------------------------

那實際上到底 `setState()` 做了什麼事？如何告訴 Flutter 有東西改變了你要處理一下，我們來挖掘它，看看實際的過程。

### State 的 setState

`setState()` 是 State 的方法，State 由 \_MyHomePageState 繼承 所以我們能使用它。可以看到參數就是一個 VoidCallback，沒有回傳值的方法，很常在開發中看到或用到，例如：元件要暴露點擊事件的話就可以使用 VoidCallback 撰寫。

1.  一開始使用 `asset()` 進行狀態檢查，必須確保 State 的狀態不是 **defunct**，這時候代表本身已使用 `dispose()` 要被銷毀了  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687Pi7VPZtVDW.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687YkfwZzmHMW.png)

2.  第二層檢查，確認 State 的狀態不是剛創建而且還沒綁定到 Element Tree 上，使用 `mounted` 屬性檢查，這時候去刷新頁面是沒有作用的  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687Xbg1mYABqV.png)

3.  第三層檢查，確認外部給予的 Callback 不是非同步方法，檢查是不是 Future，裡面也不會 await，因為實際上整個 Flutter 的繪製、渲染流程是同步的，不允許有非同步操作的影響，需要確保整體是順暢的運行  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687zl7rJFJEU2.png)

4.  最後都沒有問題後，透過 element 呼叫 `markNeedsBuild()`，標記這個元件為 dirty 髒的，代表需要 rebuild，下一幀更新

### Element 的 markNeedsBuild()

到這裡對 `setState()` 應該有一點了解了吧，接下來繼續看 Element 做了哪些事情，繼續往深處挖掘。我們看到 `markNeedsBuild()` 執行大部分工作之前都必須檢查生命週期，在正確的時候做正確的事情才能確保高效、順暢。

1.  一樣進行幾個檢查，確認對應的 Element 本身不是 **defunct** 銷毀狀態，需要是 **active** 狀態

2.  檢查 `owner` 存在不為空值，它是 Element 的 Lifecycle Manager  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687F3mFtGXBcv.png)

3.  如果正在 building 的情況不允許再呼叫 `setState()` 和 `markNeedsBuild()` 刷新，因為刷新工作已經在執行了。這也是為什麼不要 State 的 `build()` 方法裡使用 `setState()`，可是會出錯的哦  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/201206873fiLtaqZ5C.png)

4.  檢查 `dirty` 屬性，一樣如果標記過後就忽略，因為已經在處理了。最後透過 `owner` 安排任務去處理  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687CTupv8Skb3.png)

### BuildOwner 的 scheduleBuildFor()

負責將要更新的 Element 儲存到髒的 Element 清單，等待之後執行 `WidgetsBinding.drawFrame` 的時候可以被處理。

1.  首先確認是否已經在髒清單裡面，檢查 `_inDirtyList` 布林值，是的話就 return 不繼續下去
2.  接著呼叫 `onBuildScheduled()` 安排任務，並將此 Element 新增到髒清單，然後將 `_inDirtyList` 設為 true  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/2012068729YiIdlayL.png)

### 後面流程

1.  觸發 WidgetBinging 的 `_handleBuildScheduled()`

2.  觸發 SchedulerBinding 的 `ensureVisualUpdate()` → `scheduleFrame()`

3.  …

4.  觸發 WidgetBinding 的 `drawFrame()`，設置 `debugBuildingDirtyElements` 為 true，開始處理髒 Element 清單。裡面最重要的是呼叫 `buildScope()` ，真正進行 Element 處理的地方  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687Y7PrIGnIiM.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687xex1UYdsYo.png)

5.  首先對髒清單進行樹的深度排序，while 迴圈執行，淺的 Element 優先處理

6.  接著到中間會看到呼叫 Element 的 `rebuild()`，然後執行 `performRebuild()`

7.  這時候對應的 Element 就是 `RenderObjectToWidgetElement`(每個元件後面對應的都是 RenderObject，負責幫我們處理佈局、繪製，這邊就不深談這個部分)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687qtxQFcQWyE.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687COPa4zneIy.png)

### RenderObjectWidget 的 updateRenderObject()

到了這裡已經快完成更新的工作了！如果以範例來說，畫面上的 Text 元件因為倒數文字改變，等同是它的配置有異動，這時候就會呼叫 `updateRenderObject()` 來處理。這時候要看源碼的話需要到 RichText，也就是 Text 的基座，它本身是 `MultiChildRenderObjectWidget`，尋找它的 `updateRenderObject()` 方法。  
![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687ymvcnFj5XH.png)

更新 RenderParagraph 物件，因為是改變文字，這時 text 屬性就會就會被更新，並觸發寫好的 `setter`，因為是文字內容的改變會進行重繪，執行 `markNeedsPaint()`，後面的事情就交給渲染引擎去處理了。  
![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687e4rV37joQp.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230924/20120687ChfZeIzvvg.png)

------------------------------------------------------------------------

其實後續還有能繼續挖掘的源碼，但到這裡大家應該可以了解一個畫面、元件刷新的部分流程。細節很多，一步一步去探索，會發現很有趣，你會更熟悉實際上做哪些事情。當然其中牽扯了許多 Flutter 核心觀念，例如：Widget、Element、RenderObject 的三者關係、生命週期等等，大家不需要一次就懂，可以從中去學習，慢慢會影響我們開發時的想法，你也會更有 Sense，知道該做什麼樣的操作對 APP 有幫助。

------------------------------------------------------------------------

## 延伸閱讀

[Day 5: Flutter 的 StatefulWidget 和 State 生命週期，先熟悉它們再開發吧！](https://ithelp.ithome.com.tw/articles/10321406)

## Day 10: Async 和 Isolates 差異在哪裡？正確使用才能確保流暢體驗！

- 發布時間：2023-09-25 20:41:55
- 原文連結：<https://ithelp.ithome.com.tw/articles/10327324>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 10 篇

![](https://ithelp.ithome.com.tw/upload/images/20230926/201206879BSU83axid.png)

為什麼在 Flutter 開發中很常會需要 **Async** 非同步操作？因為畫面的互動、繪製刷新都是在同步的狀況下運行，為了順暢運行，需要一秒快速進行多次的渲染處理，而當我們要執行無法預期時間的相關操作或是繁重任務時，就會需要非同步來幫忙。但非同步本身的工作如果消耗的時間更久更麻煩的話，這時候就會需要 **Isolate** 隔離的協助。這兩個角色對於開發來說很重要，我們需要了解他們是什麼，以及在某些情境下該用誰來處裡任務，才能讓 APP 保持高效運行，讓使用者操作的很舒適。

在進入正題之前，需要先了解 Flutter 本身的運行狀況，它是在什麼環境下運行，由哪些重要角色支撐著，才能提供良好的性能表現以及使用者體驗。往下滑囉！

------------------------------------------------------------------------

## Flutter 運行狀況

- 1 Thread、1 Processor
- Flutter 在主隔離(Main Isolate)上運行，而隔離在運行時會有自己的 **Event Loop** 和兩個 Queue，就像一個無限循環，裡面經由 **Event Queue** 和 **Microtask Queue** 處理著所有請求和任務
- `Event Queue` → 處理大部分任務和來自用戶的操作，例如：手勢、點擊螢幕、I/O操作、佈局、繪製、繪圖、Timer、Steam等等，它們都會被加入 Queue 中，接著按照順序在 Event Loop 處理。舉例來說：為了順暢的用戶體驗，Flutter 每秒60次向 Event Queue 添加 repaint 事件  
  ![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687u4q3RvlCQc.png)

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687ITAcR65Cla.png)

- `Microtask Queue` → 負責由內部系統操作生成的任務，比用戶啟動的任務有更高的優先級。意思是只要 Microtask Queue 有任務要處理，就會先暫停 Event Queue 的工作，以 Microtask 為優先，頻繁地在兩邊進行轉換

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687dLPOM5U8GJ.png)

------------------------------------------------------------------------

## Async

`"Async is the ability to wait for other things without blocking."` 這句話來自某位開發者，很適合用來表示 Async，也就是我們熟知的非同步。

- 本身屬於**並發**運行(Concurrency)，有處理多個任務的能力，但不一定會同時處理。
- 使用 Async 的同時也會使用到 Future，代表未來的某個時候完成，我們無法知道準確時間點，也是在告訴 Dart：「這段程式碼不急，你有空再幫我處理就好了。」，會根據情況、需求自動在不同的程式區塊裡跳轉
- 雖然它是非同步操作，但使用時不會自動生成其他線程來幫忙，其實都是在相同線程，在進行 Flutter 開發時都是在相同線程、相同 isolate 進行，非同步任務會等待 UI 渲染完成後才進去動作
- 在 `Dart VM Thread` 上運行，當 await 任務完成後會向主隔離的 Event Queue 添加新的事件並標示任務完成，有點類似 Callback
- `await` 區塊結束後，才會接著處理後方的程式碼，而在 Flutter APP 裡其他程式碼一樣同時運行，其他工作區不需要停止或等待
- 符合大多數的開發情境，但不適合有複雜處理的同步任務，例如：解析大量資料、IO長時間操作，如果使用非同步處理太久，APP 得其他部分有可能會造成卡頓，因為只要是 OS 操作而非 Dart 程式碼都會暫停執行

#### Flutter 是單線程卻能夠運作順暢

整個 **Rendering Pipeline** 都是在同步中進行，所以當 `Event loop` 知道要進行佈局、繪製等操作的時候，就會讓非同步任務先暫停並等待 Pipeline 執行結束後再繼續，這樣就不會因為進行耗時操作卡住 UI。這也是為什麼使用 `setState()` 刷新只能是同步操作的原因。  
![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687d0Q8Ufct3I.png)

不會單線程畢竟有它的侷限，當有一些比較重的同步任務，例如：解析大量 json、處理圖片、長時間IO，處理過程可能會超過一個 vsync 時間，這樣 Flutter 就不能即時將 layer 送到 GPU 線程，會導致 APP janking 卡頓，這時候我們就會需要 Isolate 來幫忙解決這個問題。

> 說明：vsync 代表每一幀的渲染信號，通常在開發動畫、使用 AnimationController 時就會遇到，而如果以 60 幀順暢運行來說，一幀的時間就是 16 毫秒。

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687Ev33lJcXPE.png)

舉例：

1.  在跟人聊天的時候，快速檢查手機訊息，短短0.5秒停頓，對方感受不出來
2.  在跟人聊天的時候，這時剛好有重要訊息需要確認，可能盯著訊息5秒以上，接著再回來這段對話，對方應該會覺得尷尬或不舒服，而這個情況就會需要 Isolate 幫忙處理

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687engI66V2ut.png)

## Isolates 隔離

`"Isolates is the ability to run things in parallel. It can offload heavy computations in the app to a background worker."`

- 每個 Isolate 實際上是**並行**運行(Parallelism)，又稱為 worker isolate、background isolate、background worker
- 一個隔離使用一個線程，假設你是用 VS Code 開發，可以從 Call Stack 區塊觀察每個創建出來的隔離
- 本身不是 Thread，不同的是每個 Isolate 擁有自己的記憶體空間，不共享數據，透過 Event Loop 管理任務、處理工作。不會遇到執行緒會有的 Critical Sections, Dead Locks, Mutexes 和 Racing Condition 情境
- 只要是一幀無法完成的任務都需使用 Isolate 解決， 將長時間的同步任務、複雜運算、工作分配到多個內核(Core)去進行處理，不同程式碼在不同隔離全速運作，互不影響。可以確保 Main isolate 每秒產生60幀以上，減輕負擔，以獲得舒適的使用者體驗
- 當有多個 Isolate 同時產生時，無法確保每次都以相同的順序運行
- Isolates 之間的訊息傳輸通常執行深度的資料複製，因此記憶體使用會因此增加，隨著訊息的大小線性增加，O(n) 表示

舉例：當我在跟你講話的時候，我在抓癢，同時做兩件事卻不干擾

適合情境：

- 解析大量 JSON 字串
- 資料庫存取
- 大型檔案存取
- 圖像處理、解碼

### 使用方式 compute()

負責 **short-lived** background tasks 短時間的複雜運算，我們可以使用 Flutter 提供的 `compute()` 全局方法，迅速建立一個 Isolate 幫忙處理任務，結束後返回結果，就跟我們使用 await 非同步方法一樣，簡單有效。

``` dart
await compute(_printName, 'Yii');
```

- 第一個參數 → 運行的 function 名稱，可提供一個參數
- 第二個參數 → function 的參數，如果需要多個參數的話可以使用 Map、List 等等包裝  
  ![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687ByHqNfGx4l.png)

### 使用方式 spawn()

負責 **long-lived** background tasks 長時間的複雜運算與處理，我們可以自定義隔離，使用 `spawn()` 創建，並透過 Port API 讓 main isolate 與 worker isolate 溝通。  
![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687kMdAw983r7.png)  
![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687ulhHmojZcD.png)

#### Isolate.spawn() - 建立隔離

``` dart
Isolate.spawn(_entryPoint, _receivePort.sendPort)
```

1.  第一個參數 → Isolate 要執行的函式
2.  第二個參數 → ReceivePort 的 SendPort，給 worker isolate 跟 main isolate 的通訊管道，溝通使用。當有多個函式參數需要使用時，可以透過 `List<dynamic> args` ，裡面再透過 args\[0\]、args\[1\] 取得資料

> 補充：第二個參數，也可以自定義一個協議 Model 類別，裡面包含主要的 SendPort 跟其他的資料欄位，就不用擔心只能傳一個參數的問題。

#### ReceivePort - 接收訊息

ReceivePort 顧名思義就是接收訊息的通道，本身透過 `Stream` 實作，可以持續監聽。第一個訊息通常會是其他 Isolate 的 `SendPort` ，當前 Isolate 可以使用它發送訊息跟其他隔離溝通。

``` dart
final receivePort = ReceivePort();
```

- `first` 屬性 → 取得發送過來的訊息，為 Future。一般使用 first 後 stream 就會被關閉，所以如果需要持續接收訊息，需要將 ReceivePort 轉成廣播流，使用 `asBroadcastStream()`
- `sendPort` 屬性→ Isolate 的通訊管道，提供給其他 Isolate 發送訊息用，我們也才能收到訊息

#### SendPort - 發送訊息

使用 SendPort 發送訊息給創建它的 ReceivePort，也有可能多個 SendPort 對應一個 ReceivePort。

``` dart
sendPort.send('message');
```

#### StreamQueue - 接收訊息的佇列

實際上可以不需要 StreamQueue，但它使用上可以跟 ReceivePort 很好的進行協作，類似 ReceivePort 的 broadcastStream，將 ReceivePort 設為參數傳入，在建構的時候就開始監聽 Stream，是對於後續接收訊息還蠻方便的 API。

``` dart
StreamQueue _streamQueue = StreamQueue(_receivePort);

// Get new message from another isolate
await streamQueue.next;

// Stop receiving messages
await streamQueue.cancel();
```

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687J3kkInxaCj.png)

1.  `next()` → 負責取得其他 Isolates 透過 `SendPort` 傳送的訊息
2.  `cancel()` → 停止 Stream，也就是停止訊息資料的監聽

> 缺點：不管是透過 `spawn()` 或是 `compute()` 都會經過 Isolate 的創建與銷毀，如果頻繁創建或濫用就會有很大的記憶體消耗，這是唯一代價，所以請謹慎使用。

## 注意

- Isolate 創建、銷毀與傳遞資料，可能會耗費約 50-150ms 的時間
- 使用 multi isolates 整體計算時間會比 single isolate 多
- 本身 Isolate 是佔空間的，每當創建出來至少需要 2MB 記憶體左右甚至更多，取決於工作內容
- 通常實作上可能會使用 message 參數傳遞資料或檔案，每次都會經歷一次 copy ，這其實就存在著 **OOM** 風險。想看看，如果要返回 1 GB 大小的資料，在記憶體不多的手機上就會出現問題

## 改善

1.  減少 Isolate 創建，降低消耗
2.  減少 message 傳遞次數，以及資料大小

------------------------------------------------------------------------

## 範例解說

此範例使用 `jsonFileNameList` 紀錄準備好的3個 Json 檔案，放在本地的 `assets/` 目錄，待會要透過 Isolate 進行解析、處理。

``` dart
const List<String> jsonFileNameList = [
  'assets/a.json',
  'assets/b.json',
  'assets/c.json',
];
```

主隔離的 `getJsonDataFromFiles()` 方法，負責創建 Isolate ，並請它在背景幫忙處理檔案，按照順序取得 Json 資料後將內容返回主隔離，再讓 `main()` 印出來。下面跟大家一行一行解說，更好地去了解：

1.  首先一開始都會先創建 ReceivePort 物件，而在這個情境使用到了 StreamQueue，協助 ReceivePort 更好地處理訊息
2.  使用最重要的方法 `Isolate.spawn()` 創建隔離，`isolateParsingFile` 為 Background-Isolate 要執行的方法名稱，第二個為通訊管道
3.  兩個 Isolate 在使用時，通常一開始的互動都是互相給予自己的 SendPort，這樣對方才能跟我傳訊息。所以這裡先透過 `streamQueue.next` 取得 Isolate 的 SendPort
4.  透過迴圈請 Isolate 按照順序幫我處理檔案，一樣再使用 `[streamQueue.next](http://streamQueue.next)` 取得最新訊息，接著透過 Generator functions 傳值到外部
5.  最後傳遞 null 給 Isolate，這是我們訂的約定，只要是 null 就代表任務結束，需要釋放資源

``` dart
Stream<Map<String, dynamic>> getJsonDataFromFiles() async* {
  print('getJsonFilesContent() - Start');

  final ReceivePort receivePort = ReceivePort();
  final StreamQueue streamQueue = StreamQueue(receivePort);
  await Isolate.spawn(isolateParsingFile, receivePort.sendPort);

  final SendPort workerIsolateSendPort = await streamQueue.next;

  for (String fileName in jsonFileNameList) {
    workerIsolateSendPort.send(fileName);

    final Map<String, dynamic> jsonData = await streamQueue.next;
    yield jsonData;
  }
  print('getJsonFilesContent() - Json file parsing finished');

  workerIsolateSendPort.send(null);
  print('getJsonFilesContent() - Request worker isolate to exit()');

  await streamQueue.cancel();
  print('getJsonFilesContent() - Dispose the StreamQueue');
}
```

接下來看 Isolate 要執行的 `isolateParsingFile()` ，來仔細了解它的工作內容：

1.  起手式都是創建 ReceivePort，接著傳遞自己的 SendPort 出去，完成前置作業
2.  使用 `await for` ，代表只要收到訊息就會執行這個區塊
3.  一開始先檢查型別，而我們確定這個是檔案名稱，所以必須是字串
4.  讀取本地 JSON 檔案，使用 `jsonDecode()` 轉換成 Map，這一步是最耗時的工作，接著將結果回傳給 Main Isolate
5.  跟外部約定好了，只要收到訊息為 null 就代表工作完成，直接關閉迴圈，並在最後 `Isolate.current.kill()` 將自己清除，釋放記憶體

``` dart
void isolateParsingFile(SendPort sendPort) async {
  print('isolateParsingFile() - Worker isolate - Start');

  final ReceivePort receivePort = ReceivePort();
  sendPort.send(receivePort.sendPort);

  await for (dynamic message in receivePort) {
    if (message is String) {
      final String fileContent = await File(message).readAsString();
      final Map<String, dynamic> jsonData = jsonDecode(fileContent);

      print('isolateParsingFile() - Worker isolate - Send data to main isolate');
      sendPort.send(jsonData);
    } else if (message == null) {
      break;
    }
  }

  Isolate.current.kill();
  print('isolateParsingFile() - Worker isolate - Finished');
}
```

主程式 `main()` 呼叫 `getJsonDataFromFiles()`，本身是回傳 Stream，在這裡將每次解析到的 Json 資料印出來，印出三筆資料就完成我們的工作。以下提供 Console log ，協助驗證運行的流程。

``` dart
void main(List<String> arguments) async {
  await for (Map<String, dynamic> jsonData in getJsonDataFromFiles()) {
    print("Get json data - $jsonData");
  }
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230925/20120687POZj0RI4fv.png)

> Source: [dart_isolate](https://github.com/chyiiiiiiiiiiii/dart_isolate)

------------------------------------------------------------------------

對於 Async 和 Isolate 有沒有再更了解了，Async 在日常的開發中每天都會遇到，而 Isolate 相對來說就沒這麼頻繁出現，但大家都需要知道他們，並在對的時間選用。建議大家搭配 Isolate 範例，邊閱讀邊練習，讓自己更理解它的運作方式。更進一步，如果你需要頻繁的操作 Isolate，持續創建和銷毀，那你可以考慮建置一個 Isolate Pool 或是研究相關套件。最後，Isolate 還有很多好玩的部分，有興趣有想法都歡迎在底下跟我討論哦！

------------------------------------------------------------------------

## Reference

- <https://dart.dev/language/concurrency#how-isolates-work>
- <https://www.youtube.com/watch?v=5AxWC49ZMzs&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=yUMjt0AxVHU&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vl_AaCgudcY&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=OLAXR0TCrcc&ab_channel=EVERESTACADEMY>

## Day 11: Flutter 動畫大補帖，觀念與使用時機都告訴你！

- 發布時間：2023-09-26 15:56:24
- 原文連結：<https://ithelp.ithome.com.tw/articles/10328634>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 11 篇

![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687dqIqpEIv81.png)

在 Flutter 中，動畫在大部分開發情境下不太常使用到，很多產品都以功能為導向，有時候有趣的體驗或是酷炫的效果都會被忽略甚至是排在後面，視為往後優化的部分，所以大部分實際遇到需要動畫的情況也不多，就我了解，大部分開發者除了自身興趣外應該都對它沒有很熟悉。所以藉這個機會跟大家分享一些撰寫動畫的重點，也包含一些實作經驗與範例，希望能讓你更熟悉它。

主要動畫的分類可以分成兩種來識別，一種是 **Explicit Animation** 顯式動畫和 **Implicit Animation** 隱式動畫，在不一樣的情境下有不一樣的選擇，實現的方式有很多種，如何高效的去使用才是重點。這時侯我想大家看這兩個分類應該還是很難懂我在說什麼，沒關係，跟著我繼續往下吧！

------------------------------------------------------------------------

## 顯示動畫 (Explicit Animation)

- 製作顯示動畫的第一要素，就是需要一個 `AnimationController`，透過它我們才能完全的控制動畫，包括設置運行時間長度，會用到 Duration、開始動畫能設置初始點、反轉動畫、停止動畫等等，搭配 Tween 補間差值，能做到任何的效果呈現
- 在每一幀刷新，`AnimationController` 都會產生一個對應的數值，讓元件根據數值進行顯示上的變化。而當不使用 Tween 時(後面會提到)，就是線性的依次產生一個 0-1 的數值
- 使用時需要搭配 `AnimatedBuilder` 來進行元件的更新，務必使用它包裹 Widget Tree，才能無縫的在每幀進行刷新。切記不要用 `setState()`，雖然一樣能完成動畫效果，但實際上它無法渲染訊號同步，一旦有多個動畫要執行，或是牽扯到的範圍很大，很可能會造成卡頓
- 如果基本的動畫元件無法滿足需求時，可以透過  `AnimatedWidget` 或 `AnimatedBuilder` 實作動畫效果。我們可以自定義某個複用的效果元件，並以 XxxTransition 此規則來命名，必備參數為 `AnimationController`，通常只要看到 Transition 為後綴的元件都是顯示動畫，算是大家的共識
- 動畫的運動類型分成兩種
  - **Tween Animation** → 屬性值的變化區間，Tween 就是 Between 的簡寫，所以它的參數會有 `begin` 和 `end` 可以設置
  - **Physics Animation** → 類似Tween，只不過它的變化區間是根據物理引擎計算出來的，更加模擬真實的效果。在開發中會使用到 Simulation 相關類別去實作

#### 使用時機與情境

可以根據特性來判斷是否使用它來實作

1.  動畫會重複
2.  動畫不連貫、不順暢
3.  多個相關元件一起執行動畫

> 補充：實作時可以透過 child 參數設置不被動畫影響的元件，避免重複創建、提高效能，而最好的方式還是用 `const` Widget，節省記憶體使用

#### 相關動畫元件

| 元件                   | 說明         |
|------------------------|--------------|
| AlignTransition        | 對齊動畫     |
| DecoratedBox           | 裝飾動畫     |
| DefaultTextStyle       | 文字風格動畫 |
| Fade                   | 淡入淡出動畫 |
| Positioned             | 位置動畫     |
| RelativePositioned     | 相對位置動畫 |
| Rotation               | 旋轉動畫     |
| Scale                  | 大小倍率動畫 |
| Size                   | 尺寸動畫     |
| Slide                  | 滑動動畫     |
| StatusTransitionWidget | 狀態改變元件 |

## 隱式動畫 (**Implicit Animation)**

- 隱式就是顯示動畫的相反，使用上不需要使用 `AnimationController`，相對簡單許多，使用起來很快速、便利，只需要運行的時間長度 Duration，然後設定改變的目標值，它就能幫你做完所有事情。不過就無法控制動畫
- 有一貫的命名方式，通常一般以 **AnimatedXxx** 為規則來命名，這點一樣需要記下來。不過 AnimatedIcon 為例外，它其實是 Explicit Animation
- Flutter 本身提供很多樣的隱式動畫 Widget，例如：AnimatedContainer、AnimatedIcon、AnimatedAlign 等等，下方我會列出來

#### 使用時機與情境

1.  沒有符合顯示動畫的條件時

#### 相關動畫元件

| 元件                          | 說明                                       |
|-------------------------------|--------------------------------------------|
| AnimatedAlign                 | 對齊動畫                                   |
| AnimatedContainer             | 綜合動畫，更改支援的所有屬性都會有動畫效果 |
| AnimatedCrossFade             | 針對兩個元件執行交換的 Fade 動畫效果       |
| AnimatedDefaultTextStyle      | 文字動畫                                   |
| AnimatedOpacity               | 透明度動畫                                 |
| AnimatedPhysicalModel         | 陰影動畫                                   |
| AnimatedTheme                 | 主題風格動畫                               |
| AnimatedSize                  | 大小尺寸動畫                               |
| AnimatedPadding               | Padding動畫                                |
| AnimatedRotation              | 旋轉動畫                                   |
| AnimatedSwitcher              | 元件漸變動畫，跟 AnimatedCrossFade 類似    |
| AnimatedScale                 | 動畫版本的 Transform.scale，影響大小       |
| AnimatedSlide                 | 滑動動畫                                   |
| AnimatedPositioned            | 位置動畫                                   |
| AnimatedPositionedDirectional | 位置方向動畫                               |

![Implicit Animation](https://i.imgur.com/xUeSG6v.gif)

## 動畫控制器 (AnimationController)

- 製作顯式動畫時，都會需要 **AnimationController** 來管理和控制動畫，可以根據 APP、頁面狀態去操作動畫，給予不一樣的效果。而我們在使用時，通常會在元件的 State with `SingleTickerProviderStateMixin` 並在創建 AnimationController 的時候設置 `vsync` 參數為 this，緊接著就能開始製作動畫了
- 大部分時候我們只需一個 AnimationController，搭配 `SingleTickerProviderStateMixin`，顧名思義它就是適合一個 AnimationController 的情境。如果需要多個 AnimationController 來管理多個動畫，可以選用 `TickerProviderStateMixin`，同時管理多個 Ticker 實體與每幀更新同步

> 詳細動畫的刷新過程跟源碼分析可以閱讀下一篇文章，分享了細節，這邊就不深入探討了。  
> [Day 12: 研究 Flutter 動畫，背後的 vsync 跟 Ticker 有多重要？](https://ithelp.ithome.com.tw/articles/10329250)

### SingleTickerProviderMixin

- 適合 State 裡面只有一個 **AnimationController**，使用 `vsync` 創建一個 TickerProvider

### TickerProviderMixin

- 適合 State 裡面需要多個 **AnimationController** 同時使用，使用到多個 TickerProvider

## 補間 (Tween)

- **Between** 代名詞，擁有開始(begin)和結束(end)兩個參數，動畫的數值變化只會在這個區間更動，內容可以是任何類型，例如：int、double、Offset、String、Color、Matrix4 等等
- 普遍的使用方式 `Tween<T>`，使用泛型放置你期望的型別，當然也可以使用特定類型的 Tween 類去替代，下方有幫大家條列了
- 與 AnimationController 搭配，它負責管理 Tween，使用 `animate()` 生成 `Animation` 物件

#### 可使用種類

| 類型                  | 說明                                           |
|-----------------------|------------------------------------------------|
| IntTween              | 數值變化                                       |
| StepTween             | 使用 double 刪除小數值返回整數部分             |
| ColorTween            | 顏色變化                                       |
| SizeTween             | 大小變化                                       |
| BoxConstraintsTween   | 約束變化                                       |
| DecorationTween       | 裝飾變化，例如：BoxDecoration、ShapeDecoration |
| EdgeInsetsTween       | EdgeInsets變化，可搭配 Padding 使用            |
| Matrix4Tween          | 矩陣變化                                       |
| TextStyleTween        | 文字風格變化                                   |
| FractionalOffsetTween | 小數變化                                       |
| MaterialPointArcTween | 圓弧變化                                       |
| RectTween             | 矩形變化，使用 null 代表 Rect.zero             |
| AlignmentTween        | 對齊變化                                       |
| ConstantTween         | 常數變化                                       |

#### 產生核心 Animation

實現動畫的核心類，根據 Tween 生成更新的區間數值，而元件根據數值的更新來重繪，產生動畫效果

``` dart
// 1.
Animation animation = _animationController.drive(
  Tween<Offset>(
    begin: const Offset(0, 0),
    end: const Offset(100, 200),
  ),
);

// 2.
Animation animation = Tween<Offset>(
  begin: const Offset(0, 0),
  end: const Offset(100, 200),
).animate(_animationController);
```

#### 串連 Chain the Tweens

- 可以將多個 Tween 進行組合，簡單的連結它們，例如：給 Tween 添加 **Curve** 曲線。有時候Tween 很難描述一個複雜動畫，這個時候就需要進行疊加了

``` dart
Animation animation = Tween(
      begin: 0,
      end: 50,
    )
        .chain(
          CurveTween(curve: Curves.easeIn),
        )
        .animate(animation);
```

#### 自定義 Tween

- 繼承 `Tween` 自定義特殊情境的差值，任何類型的改變，都可以作為 `Tween`
- 根據動畫的時間進度參數 `t` 進行處理和計算，讓結果不同

以下範例，實作出文字陸續出現的效果，就像打字機一樣：

``` dart
class TypingTween extends Tween<String> {
  TypingTween({
    String begin = '',
    String? end,
  }) : super(
          begin: begin,
          end: end,
        );

  @override
  String lerp(double t) {
    final endStringLength = end?.length ?? 0;
    final cutPosition = (endStringLength * t).round();
    final displayedText = end?.substring(0, cutPosition) ?? '';

    return displayedText;
  }
}
```

![Custom Tween](https://i.imgur.com/6T6p8Aw.gif)

## Curve

- 曲線本身是一個數學函數 **f(x)**，控制動畫在時間上變化的速度，行進的曲線。預設動畫以線性方式動作，而它能讓動畫變的更加自然、真實，避免生硬的動畫過程，例如讓行進從慢速開始然後加速
- 在動畫中，過程被稱為**插值器**(interpolator)，`Curves` 提供了很多不同類型的選擇，覆蓋了大部分的使用場景，例如：`Curves.easeIn`、`Curves.bounceInOut`、`Curves.fastOutSlowIn`，總共 38 種，詳細可以到官方文件上了解

#### 可使用種類(38種)

`Curves.easeIn` → 動畫從慢速開始然後加速  
`Curves.easeInOut` → 動畫從慢速開始，加速，然後減速  
… 詳細可查看官方文件，有呈現所有的運動效果

[Link: Curves class](https://api.flutter.dev/flutter/animation/Curves-class.html?gclid=Cj0KCQjw_5unBhCMARIsACZyzS0wOARvsZRleDe6PZydfngJva2sTYsJcb7xifZtCfNW686TaHhE0-kaAmLoEALw_wcB&gclsrc=aw.ds)

### CurvedAnimation

- 根據曲線(Curve)來生成**非線性**的區間值，可以讓動畫更自然，根據幾種運動方式去運行，比較不會讓人感覺古板
- 很多情況下，動畫的發生速率是變化的，例如：加速、減速
- 甚至能設定這個 Animation 在整體動畫的兩個指定時間點出現，使用 `Interval` 實作。第一個參數為開始，第二個參數為結束，設定 0-1，例如：可以設定時間長度在 0.25 開始執行動畫

``` dart
Animation animation = Tween<Offset>(begin: const Offset(0, 0), end: const Offset(100, 200)).animate(_animationController);
// 1.
animation = CurvedAnimation(parent: _animationController, curve: Cureves.easeInOut)

// 2.
Animation animation2 = CurvedAnimation(
  parent: _animationController,
  curve: const Interval(0, .6, curve: Curves.fastOutSlowIn),
);
```

## AnimatedBuilder

- 只要是顯示動畫都會需要用到 AnimatedBuilder，跟 `AnimationController` 搭配使用，精準的進行畫面重繪
- 參數
  - `child` → 設置不需要更新、變化的元件，不會因為動畫執行而重複創建和浪費資源，更好的是幫元件加上 **const**，確保編譯時就創建確定
  - `builder(context, child)` → 可以直接拿 `child` 來用，它就是我們賦予不會被影響的部分，外面包裹需要動畫更新的元件

> 再提醒一次，切記盡量不要使用 `addListener()` 和 `setState()` 進行動畫刷新，尤其是擁有一個 Long widget tree，會降低 APP 性能

![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687cn2Wjhz4dO.png)  
![AnimatedBuilder](https://i.imgur.com/Au4l4T2.gif)

## AnimatedWidget(Custom Animation Widget)

- 如果 `build()` 的 Widget Tree 變得腫大且難閱讀時，可以將動畫部分獨立出來一個新的 Widget。這時候很適合使用自定義的 AnimatedWidget，將 AnimatedBuilder 包成 Widget，除了可讀性高之外，以後也可以複用，不需要重寫相同效果，可以實作一個自己的動畫元件集合
- 屬於顯示動畫，需要 `Listenable` 作為參數，AnimationController、Animation 都是它的子類，根據命名規則，通常會以 **xxxTransition** 的命名方式
- 建議暴露一個 `child` 參數作為性能優化，可以提前創建不被影響  
  ![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687KSs081QIvA.png)

## TweenAnimationBuilder

- 實際上也是 **Implicit Animation** 隱式動畫，類似 AnimatedBuilder 但是不需要 AnimationController 的幫助
- 一樣設置 **Tween**，固定的 Tween 可以使用 `static final` 聲明，節省記憶體消耗
- 適合情境
  1.  動畫不符合 Explicit Animation 條件
  2.  不需要 AnimationController 掌控動畫
  3.  需要 Curve 來呈現跳耀、非線性過程

``` dart
TweenAnimationBuilder(
  tween: ColorTween(begin: Colors.blue, end: Colors.green),
  duration: const Duration(milliseconds: 1500),
  curve: Curves.bounceInOut,
  builder: (context, tween, child) {
    return Container(
      width: 100.0,
      height: 100.0,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: tween,
        borderRadius: BorderRadius.circular(20.0),
      ),
      child: child,
    );
  },
)
```

![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687TwsxceO4Yt.png)

------------------------------------------------------------------------

## 動畫的選擇

以下是在實際開發場景中，我們如何針對動畫的需求條件來決定要使用哪種方式來實現。(此圖參考 Emily Fortura 製作中文版本)  
![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687qi5B1fU2vc.png)

## 補充

### 注意

- 列表元件在實作時需考慮到緩存範圍，因為會優先繪製可視區域外的一些元件，可能在還沒滾動到它們時，動畫就已經結束了，使用者會看不到效果

### 技巧

- 實作動畫經常搭配的元素
  1.  Stack
  2.  Positioned
  3.  Transform
- 觀察動畫，歸納出我們看到的效果，例如：重疊、變小、位移、更換元件，分解之後再接著一步一步實作它們
- 了解三角函數對畫東西、做動畫有幫助。例如：當數值一下負一下正，數值來回移動，可以判斷為三角函數的 `sin(value)`，數值越長頻率越高，越小波形越平緩  
  ![](https://ithelp.ithome.com.tw/upload/images/20230926/20120687LIQZ8xNSHN.png)

### 撰寫有關時間的測試

- 使用 `clock` 套件，透過模擬的時間，在測試環節可快速跳過並驗證。不需要使用 Future 和 Datetime 耗費真實時間

> [Package: clock](https://pub.dev/packages/clock)

------------------------------------------------------------------------

本文說明了動畫的核心幾部分，希望有讓大家了解在什麼情境下要選擇什麼實作方式，通常一種動畫效果可以有很多種方式來完成它，但我們可以挑相對快速且方便的作法，根據動畫的作動、行為、可操作性來判斷。如果都不夠你用的話，那我們就使用 Canvas 自己畫吧，有興趣的朋友跟我說，會在出其他文章來討論。

動畫除了是一個效果、一個產品需求之外，它同時也是提升使用者體驗的重要元素，當市面上產品的呈現方式都差不多時，可以想想是否能讓自家產品脫穎而出，但凡事過多都會造成反效果，所以規劃、嘗試很重要，適當才能夠畫龍點睛。思考一下，讓 APP 擁有自己的特點吧！

------------------------------------------------------------------------

## 延伸閱讀

[Day 12: 研究 Flutter 動畫，背後的 vsync 跟 Ticker 有多重要？](https://ithelp.ithome.com.tw/articles/10329250)

## Day 12: 研究 Flutter 動畫，背後的 vsync 跟 Ticker 有多重要？

- 發布時間：2023-09-27 12:03:07
- 原文連結：<https://ithelp.ithome.com.tw/articles/10329250>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 12 篇

![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687hQ0xHW7Fnu.png)

上一篇介紹了動畫的兩大分類，**Explicit Animation** 和 **Implicit Animation**，以及實作時會用到的幾個重要元素，包含 **AnimationController**、**Tween**、**Curve**、**AnimatedBuilder** 和 **TweenAnimationBuilder**，有了他們就可以實作出九成的動畫效果，大部分場景都能實現。最後也分享了動畫路線圖，幫助你在看到需求與設計時，可以根據幾個條件去判斷要選擇哪種實作方式。

本文要帶你深入 `vsync`、`Ticker`、`TickerProvider`，他們實際上在背後做了哪些事情，我們從源碼來了解。相信你看懂後，對實作上會更有想法，避免一些效能低效的選擇，讓動畫保持高幀運行。

------------------------------------------------------------------------

在實作 Explicit Animation 的時候都會使用到 `vsync`，但很多人都設置 this 後就去製作後面的動畫了，但實際上你知道 `vsync` 關鍵字是什麼意思嗎? 實作時幫 State with `SingleTickerProviderStateMixin` 就完成前置作業了? Flutter Framework 讓我們輕鬆的實作動畫，應該也會很好奇它們的真面目吧，帶你了解一下  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687c1ZrO1WPBh.png)

1.  vsync 本身是 `TickerProvider`，訊號提供者，必須要有才能提供給 Rendering Pipeline 信號，維持與畫面渲染的每一幀同步，精準在每一幀進行處理。才能讓 AnimatedBuilder 刷新，實現順暢的運行效果
2.  實際上背後是透過 `SchedulerBinding.instance.scheduleFrameCallback()` 在每幀觸發刷新
3.  在 AnimationController 創建的時候同時透過 `createTicker()` 創建一個新的 `TickerProvider`，負責處理當前 AnimationController 的訊號通知，當訊號來的時候進行畫面刷新  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687VIy9ll1BWl.png)

看到 `_internalSetValue()` 方法，在一開始會根據初始值設置做一些初始的狀態設定，確認`AnimationStatus`  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687i4iOjIMgME.png)

接著重要的 `vsync.createTicker(_tick)` 做了什麼？它本身是一個抽象類，給子類繼承實作方法，也只有一個 `createTicker()`，參數 onTick 就是收到每幀的信號時的 callback。如果以範例來說是 with `SingleTickerProviderStateMixin`，這邊就看它是如何 override  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687EjeXytR5oI.png)

1.  首先檢查 `_ticker` 屬性也就是 TickerProvider，是否為空值，理論上這邊要是空值才正常，會幫忙創建一個新的 Ticker。如果不為空，代表你的 State 可能使用多個 AnimationController 導致有多個計時器，這時候你應該選擇使用 `TickerProviderStateMixin` 代替，否則會報錯

2.  創建 Ticker 的同時，一樣設置 onTick callback，讓幀數更動時可以觸發  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687kF46VBla8N.png)

3.  在 Ticker 內部追蹤 onTick callback 的觸發來源，找到了根源 `scheduleTick()` 方法，主要幫下一幀做準備，到的時候通知我

4.  使用 `SchedulerBinding.instance.scheduleFrameCallback()` 給予 `_tick()` callback，參數為當前時間的 `timeStamp`  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687EKKLMebBls.png)

5.  在第一次 tick 的時候，透過初始時間更新 `_startTime` 屬性，提供之後的每幀計算使用，算出時間間隔，也可以從這裡統計一秒有幾幀，進而看出是否掉幀的情況。

6.  接著呼叫外部傳入的 `_onTick()` ，參數為每次觸發時間跟初始時間計算出來的時間間隔

7.  最後根據狀態安排下一幀的處理，執行 `scheduleTick()`，如果動畫結束的話就不會繼續安排也不會在觸發 `_onTick()`  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/201206875CMfUdPa3s.png)

實際在動畫運行中將間隔印出來，確實為1幀16毫秒，保持高效運作。  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687UGJU4Psg9P.png)

1.  最後到 AnimationController 處理 `_tick()` callback，這裡的 `elapsed` 參數為此幀跟動畫初始時機的間隔時間長度，以 Duration 表示
2.  透過 `_simulation!.isDone(elapsedInSeconds)` 檢查動畫是否完成，使用當前時間跟完整運行動畫的 Duration 進行比較，超過的話就代表完成。AnimationController 使用 **InterpolationSimulation**，可以看 `isDone()` 覆寫內容
3.  動畫完成的話就更新 `_status` 狀態為 **completed** 或是 **dismiss**，並使用 `stop()` 停止動畫
4.  最後經由 `notifyStatusListeners(status)` 觸發 **AnimationStatusListener**，通知有監聽狀態的 AnimationController  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687xrqUL3G6wJ.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/201206874y7oYnJAr6.png)

## AnimatedBuilder

到這邊你以為結束了嗎，其實還沒。上面只是了解每幀訊號的通知，跟動畫有關係的元件怎麼知道要刷新了呢，這時候就會轉移到另一個重點 **AnimatedBuilder**，我有設置相同的 `_animationController` 物件，而 AnimationController 本身也是 **Listenable**  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687UMF3QPVrz7.png)

1.  實際上 **AnimatedBuilder** 的根源是基於 **AnimatedWidget** 來實作，一樣都有 `listenable` 物件
2.  **AnimatedWidget** 是一個 StatefulWidget，在一開始 `listenable` 進行變化監聽，`_handleChange` callback  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687PdOGBByZFw.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230927/201206876KlTYi4CTb.png)

我在 callback 觸發的時候順便印出重繪次數，也確認設置的1秒動畫總共消耗了60幀完成。以下提供實際的範例驗證，動畫運行順暢。  
![](https://ithelp.ithome.com.tw/upload/images/20230927/20120687qdTsu2GhNc.png)  
![AnimatedBuilder](https://i.imgur.com/SiPa6vl.gif)

------------------------------------------------------------------------

## 補充

### Ticker & createTicker()

- 類似刷新率
- 設置一個 callback，參數 **Duration**，持續通知每一幀跟初始時間比較後經過多久，可以在這裡處理某些事情，例如：計算每幀間隔多久(毫秒)、計算位置後刷新
- 返回 **Ticker** 物件，記得在 State 銷毀、觸發 `dispose()` 的時候進行釋放
- 實際場景也可搭配 `ChangeNotifier` 觸發更新

``` dart
@override
void initState() {
  super.initState();

  _ticker = createTicker((Duration elapsed) {
    debugPrint('$lastTime, $elapsed, ${elapsed - lastTime}');
    lastTime = elapsed;

    setState(() {});
  });
  _ticker.start();
}

@override
void dispose() {
  _ticker.dispose();
  
  super.dispose();
}
```

------------------------------------------------------------------------

經過本文大家已經知道動畫背後的核心 vsync、Ticker 和 TickerProvider 是什麼，它們做了哪些事情來確保動畫更新。而當我們了解後，以後在開發時遇到問題也會更有想法，知道可能有哪些原因而導致，提高開發效率。建議大家多玩玩每種動畫，實作屬於自己的效果，搭配一些頁面操作，也會更了解差異性。

有什麼想法都歡迎交流，覺得不錯的話跟我說，我們在一起研究第三篇！

## Day 13: 在 Dart 與 Flutter 開發中常用的幾種 Pattern，為什麼需要它們？

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

## Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)

- 發布時間：2023-09-29 17:51:36
- 原文連結：<https://ithelp.ithome.com.tw/articles/10330647>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 14 篇

![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687vVwg8lTVBc.png)

當我們開發 Flutter 一段時間後，想必都會有自己習慣的開發方式跟技巧，但有時候很方便、速度快的方式卻不代表是好的，有可能開發上很省時卻導致性能有缺陷，記憶體使用過多。有實際去了解並驗證過嗎？當我們熟悉開發技巧、熟悉產品後，就會想要往高品質前進，希望提供的給用戶的東西是很棒的，這點沒錯吧！而良好的開發習慣也能幫助到自己或是團隊，不管是效率、程式碼可讀性、專案可維護性等等，這些是本文想要跟大家分享的內容，希望一起養成好習慣，我們馬上往下開始吧！

------------------------------------------------------------------------

## static final 修飾

- 定義不太變更的固定的實體物件，在相同類型的物件上不需要創建重複的記憶體，第一次類別初始化後可以在所有實體上分享，提高效能
- 可以很快速了解變數在哪裡被初始化，並且不會再被更改，提升可讀性與維護性

## late final 修飾

- 主要特性是擁有 `lazy computation` (惰性計算) 的特性，使用的時候才初始化，節省記憶體成本，並且只能對它賦值一次，在初始化後是無法改變的。我們可以在一開始給予數值或是使用方法的回傳值
- 適合昂貴的操作和存取，例如：存取檔案。如果內容是固定的話，就不適合使用，可以選擇 `static const` 和 `static final`

``` dart
// 1.
late final String result = 'Hi';

// 2.
late final String result2 = _getComplexTaskResult();

String _getComplexTaskResult() {
    return 'I am Yii.';
}
```

> 提醒：使用 `late` 的前提是必須知道你在做什麼，而不是盲目使用它，否則可能會發生不可預期的錯誤。因為已經跟 compiler 承諾，所以發生錯誤時是在 Runtime

## 元件分子原則

盡可能地分離、縮小 Widget，建議 Widget 開發基於原子設計(Atomic Design)，將頁面切分開來、將大區塊切割開來，每個元件都是基於其他元件而組成。

#### 優點

1.  耦合度低，在某個元件更新後也不太會影響到其他地方，達到有效隔離
2.  小的元件也會更容易讓人了解每個元件的關聯性，有效幫助開發且避免重複
3.  將元件切分後，進而能確保一些元件為 `const`，有效避免 build 複雜的 Widget Tree
4.  **Widget Inspector** 上查看 Widget Tree，一目了然，很好理解當前的階層關係，輕鬆追蹤問題

#### 元件腫大的缺點

1.  **可閱讀性低，很難理解**。當元件又大又複雜的時候，大腦一次接收太多資訊會更難理解內容，而且就像大家詬病的洋蔥式寫法，閱讀上會變得比較沒耐心
2.  \*\*難找錯誤。\*\*如果想修正錯誤發生的區塊，甚至是進行替換，可能需要先閱讀大量代碼，再進行逐步調整，會佔用我們寶貴的時間
3.  \*\*容易重寫相同元件代碼。\*\*如果元件已經臃腫、拆分麻煩的時候，很多開發者第一直覺會直接撰寫新的重複元件

## 盡量使用 const 元件

1.  使用 `const`，可以在編譯期間就確認內容，不需要在 Runtime 時計算、檢查，也不能修改，提升整體效能和穩定性
2.  藉此固定相同類型實體的記憶體，並在需要一樣物件時的重複使用，可節省記憶體，避免重建造成多餘的效能消耗，讓 Flutter 只處理應該更新的元件

``` dart
x = SizedBox.shrink();
y = SizedBox.shrink();
x == y // false

x = const SizedBox.shrink();
y = const SizedBox.shrink();
x == y // true
```

## 使用 Widget 代替 helper method、functional-widget

使用 Custom Widget 的好處有哪些以下幫你列出來：

1.  可以讓元件擁有 `const` constructor，並且當沒有動態參數要設置時，可以使用 `const`。在每次的 rebuild 都可以省略此元件的處理，使用相同記憶體相同實體，不需要其他消耗
2.  元件可以在 DevTools 的 **Widget Inspector** 上瀏覽與快速定位，看到很長的 Widget Tree 也不會害怕
3.  元件發生錯誤、例外、崩潰時，可以在 **Stack Trace** 上顯示精確位置，有效縮短查找時間
4.  在 UI code 或是 Widget Inspector 查看時有良好的可讀性
5.  每個獨立元件可擁有自己的 `context`，在進行一些 context 操作上會更適合，例如：存取 InheritedWidget，監聽狀態後的觸發刷新，可以精準處理而不會影響到其他元件，造成資源浪費。當然你可以使用 Builder 包裹來處理，但這不是最好的解法

#### 不建議

1.  使用 functional-widget 沒辦法賦予 `const`，每次 rebuild 都是一個消耗，記憶體使用上升  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687CdAjhXKd73.png)

2.  **Widget Inspector** 上查看到的會是第一個包裹元件，以例子來看就都是 Container，這裡不會顯示 function 名稱，在龐大的樹中你很難了解這是什麼元件、它在 APP 上的樣子  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687cMBiEEP99Y.png)

3.  當錯發生時可以知道是哪個 function 出問題，不過資訊顯示上會比較多  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687CblxpeMsjX.png)

4.  假設有使用 ****Crashlytics**** 或是 **Sentry** 這類的錯誤捕捉服務，資訊會有所不同。以 Sentry 範例來看，標題為是顯示哪個 Route，也就是哪個頁面發生問題，沒有辦法精準定位。  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687yK3SBPnVaZ.png)

#### 正確方式

1.  當我們使用自定義的元件，在沒有動態參數的情境下，可以給予 `const`，有效節省資源。並且可讀性、穩定性高  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687imSAsVs6xR.png)

2.  **Widget Inspector** 上的瀏覽很簡單、輕鬆，直接看出來是哪些元件，可讀性高，會更讓人願意使用工具幫忙解決問題  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687B9lHzSG90n.png)

3.  當發生錯誤時，在 **Stack Trace** 可以直接知道是哪個元件發生問題，資訊顯示上更精簡  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687ZVJE29zwQ9.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687nhPk9ShIBy.png)

4.  **Sentry** 能搜集到的資訊也更明確，標題直接顯示哪個檔案的哪個元件有問題，下方的 **Stack Trace** 流程一樣很好理解  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687fcl6rigdVo.png)

> 請養成創建元件的習慣，除了好處多以外，也幫專案品質跟團隊想想吧，讓自己和大家都能夠輕鬆開發。

## 空白元件請使用 SizedBox 代替 Container

#### Container

1.  預設在一開始創建的時候就會適應 Parent 給的約束，自動帶有長寬、限定大小，而且因為會根據 Parent 而動態更新，導致無法設置 `const` constructor
2.  在這種情況之下，我們每使用一個 Container 就會創建一個新的實體，也代表記憶體使用會持續增加  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687r0SQTPjctc.png)

#### SizedBox

1.  大部分的使用上都可以為 `const`，有設置 `const` 建構子，長寬不需設置也不會被約束影響，能以高效的方式實現空白 placeholder
2.  以最常使用的 `SizedBox.shrink()` 來看，一開始就設置長寬為 0，不會佔 UI 任何空間
3.  直接面對 **SingleChildRenderObjectWidget** 本身，裡面只有針對 **BoxConstraints** 去做設置，內容很單純  
    ![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687IwinUeELlQ.png)

## 使用 StatefulBuilder 進行局部更新

如果專案裡沒有使用其他狀態管理框架，或是 Widget tree 龐大時，更新一個狀態就會導致整顆樹重建，這是個會降低性能的操作。這時候可以使用 StatefulBuilder 包裹提供元件，其中的 `setState` 可以用來更新指定元件，使用方式都一樣，讓其他不相關的元件可以保持原樣，不受影響。也很適合 Dialog 和 BottomSheet 相關元件使用，很方便的進行更新。

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

## 維持 Synchronous BuildContexts

- 因為 UI 在 `build()` 執行時是同步處理，但通常在跟使用者互動後(手勢操作、點擊按鈕…)有可能會觸發非同步任務，如果任務處理完後需要進行一些 `context` 的存取和操作，必須確保 Widget Tree 是否創建完成並且 element 沒有解除綁定(因為 context 本身就是 element)，否則會出錯和崩潰
- context 操作包含 `of(context)` 靜態函式的 InheritedWidget 存取

預設的 `flutter_lints` 都會即時顯示提醒，說明不要在執行非同步任務後存取 **BuildContexts**。  
![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687GQwnGG04h7.png)

需要在存取 BuildContexts 之前，先透過 `mounted` 確保 State 跟隨 Element 在樹，如果沒有則不進行後續處理。

``` dart
ElevatedButton(
    onPressed: () async {
        await Future.delayed(const Duration(seconds: 2), () {});
        if (!mounted) return;

        Navigator.of(context).pop();
    },
    child: const Text('Pop page.'),
),
```

還有另一種方式，可先暫存需要的物件或資源，等非同步處理完後再透過物件進行操作。

``` dart
ElevatedButton(
    onPressed: () async {
        ScaffoldMessengerState messengerState = ScaffoldMessenger.of(context);

        await Future.delayed(const Duration(seconds: 2), () {});

        messengerState.showSnackBar(const SnackBar(content: Text('Pop!')));
    },
    child: const Text('Pop page.'),
),
```

## 避免 AnimationController 搭配 setState() 更新動畫

1.  不要使用 `addListener()` 監聽動畫更新後，在裡面使用 `setState()` 刷新元件。`setState()` 的目的是刷新整個 Widget Tree，但實際在大部分情境上，會受動畫數值影響的元件只是其中一小部分，這個錯誤的使用方式將導致重建整個 UI，影響到其他元件，可能會讓畫面延遲、卡頓，造成體驗不佳
2.  盡量搭配 **AnimatedBuilder** 包裹指定區塊、對應元件，準確地刷新元件，動畫才能以最順暢的方式呈現。

#### 錯誤方式

``` dart
void initState() {
    super.initState();

    _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 1),
    );
    _animationController.addListener(() => setState(() {}));
    _animationController.forward();
}
```

![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687RHuIR4UOFt.png)

#### 正確方式

``` dart
void initState() {
    _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 1),
    );
    // No addListener() and setState()
    _animationController.forward();
}
```

在使用 **AnimatedBuilder** 時，記得將不需要動畫、不會受動畫影響的子元件透過 `child` 參數設置，並在 `builder` 裡拿來使用。  
![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687JjhLwabgHy.png)  
![AnimatedBuilder](https://i.imgur.com/Js1IiPg.gif)

## 避免 Opacity 搭配 Animation

1.  改變透明度本身是一個昂貴且耗效能的工作，對於引擎處理上會花費更多成本
2.  實現淡入淡出的替代方案，可以使用 **FadeTransition** 或 **AnimatedOpacity**
3.  **FadeTransition** 本身是 **SingleChildRenderObjectWidget**，運行上更精簡、高效，不需要像 AnimatedBuilder 觸發 builder 來繪製UI，實際上更新會在核心 RenderObject 中 Layout 和 Paint 之間進行，直接透過 `markNeedsPaint()` 直接刷新

#### 不建議

``` dart
AnimatedBuilder(
    animation: _animationController,
    child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
            color: Colors.blue,
            borderRadius: BorderRadius.circular(20),
        ),
    ),
    builder: (context, child) {
        return Opacity(
            opacity: _animationController.value,
            child: child,
        );
    },
),
```

#### 正確方式

1.  使用 AnimationController 搭配 **FadeTransition** 直接透過 **RenderObject** 優化效能，沒有多餘處理

``` dart
FadeTransition(
    opacity: _animationController,
    child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
            color: Colors.blue,
            borderRadius: BorderRadius.circular(20),
        ),
    ),
),
```

2.  使用 **AnimatedOpacity**，可以讓我們根據狀態給予指定數值，在兩數值間進行漸變。實際上本身在內部也是使用了 **FadeTransition**，只是多包了一層

``` dart
AnimatedOpacity(
    opacity: isVisible ? 0 : 1,
    duration: const Duration(seconds: 1),
    child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
            color: Colors.blue,
            borderRadius: BorderRadius.circular(20),
        ),
    ),
),
```

![](https://ithelp.ithome.com.tw/upload/images/20230929/20120687lEvWne1k9s.png)  
![AnimatedOpacity](https://i.imgur.com/CHTLOyG.gif)

## 滾動元件 Scrollable Widget

#### 盡量使用 ****builder 建構子來創建****

`builder()` 代表只創建即將顯示和在畫面上的元件，這些 item 屬於 lazy loaded。一般的建構子方式，會導致如果有 1000 個元件，全部都會在一開始就創建，體驗上很差。

1.  **SliverList** → `SliverList.builder()`
2.  **SliverGrid** → `SliverGrid.builder()`
3.  **ListView** → `ListView.builder()`
4.  **GridView** → `GridView.builder()`
5.  **InteractiveViewer** → `InteractiveViewer.builder()`
6.  **TableView** → `TableView.builder()`。表格瀏覽，跟隨 Flutter 3.13 推出，可安裝 [two_dimensional_scrollables](https://pub.dev/packages/two_dimensional_scrollables?fbclid=IwAR13u0gn-q7r4OWfLHORHlMcXOzrZYYdpRPOGWXN2rX8EV6Idhntuh-aacM) 套件使用

### 設置 itemExtent

1.  主要可以固定列表上的子元件長寬，如果是垂直滾動代表是高度; 如果是水平滾動代表是寬度
2.  有助於 Flutter 計算 ListView 的滾動位置，提前知道子元件的範圍，而不是創建時計算每個元件的資訊(尤其是在滾動位置頻繁變化時)，可以節省成本，讓整體的滾動體驗更好
3.  類似的元件 **SliverFixedExtentList**，可以使用 `prototypeItem` 屬性設置，提升效能

``` dart
ListView.builder(
    itemCount: 500,
    itemExtent: 100,
    itemBuilder: (context, index) {
        return Container();
    },
),
```

### 避免使用 shrinkWrap

1.  ScrollView 在一般情況下會需要延展到 `scrollDirection` 指定方向的最大範圍，先確認滑動空間。所以我們都會使用 **Expanded** 來包裹 ScrollView，否則會報錯
2.  如果不想要預設佔滿的話就可以設置 `shrinkWrap` 為 true，但是這個情境下 ScrollView 就會根據內容的變動、多寡來頻繁計算需要顯示的滾動空間，以達成收縮效果，它的代價就是成本很高，一樣會影響 APP 性能

``` dart
ListView.builder(
    itemCount: 500,
    itemExtent: 100,
    shrinkWrap: true,
    itemBuilder: (context, index) {
        return Container();
    },
),
```

### 列表載入多張高像素圖片

預設情況下 item-widget 保持活動狀態，不會再重新繪製，也不會在可視範圍之外被垃圾回收。實際使用者操作滾動時，原本的 item 雖然沒有在畫面上顯示，但是一樣存在，滾動回來後直接顯示，不需要繪製消耗資源，為了確保滑動順暢

``` dart
// 預設為true，讓每個item保持活動，不被銷毀
addAutomaticKeepAlives: true

// 預設為true，每個item都用RepainBoundry包裝，它只繪製一次以獲得更高的性能
addRepaintBoundaries: true
```

#### 但是

1.  加載大量的高像素圖片後，因為沒有被釋放肯定會消耗大量記憶體，最終可能會 OOM 使 APP 崩潰。可以輕鬆地禁用它們，這樣不可見的 item 就會被自動處理和被垃圾回收。
2.  將參數設置為 `false`，可能會導致使用更多 CPU 和 GPU 工作，因為需要重新繪製並管理狀態，但它可以解決記憶體問題，並且同時獲得所需情境下的效果。

> 不過還是要根據實際狀況來評估，請嘗試後再做決定，透過 DevTools 協助我們

``` dart
ListView.builder(
    itemCount: 500,
    itemExtent: 100,
    addAutomaticKeepAlives: false,
    addRepaintBoundaries: false,
    itemBuilder: (context, index) {
        return Image.asset('assets/images/big_image.png');
    },
)
```

------------------------------------------------------------------------

## 總結

本文說明了一些提高 APP 性能的開發觀念與技巧，讓我們可以在節省資源的情況下發揮最好表現，讓產品順暢運行且保持穩定。很多問題都是由細小的原因累積而成，不要覺得隨意開發專案還是保持順暢，可能只是我們覺得，實際上在用戶的裝置上並不理想，所以開發時的每個細節都很重要。同時記得要透過 DevTools 協助開發，養成好習慣，以後會感謝自己的。

## 延伸閱讀

- [Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)](https://ithelp.ithome.com.tw/articles/10331424)

## 參考與相關資源

- <https://www.youtube.com/watch?v=bzWaMpD1LHY&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=qax_nOpgz7E&t=19s&ab_channel=Flutter>
- <https://stackoverflow.com/questions/53234825/what-is-the-difference-between-functions-and-classes-to-create-reusable-widgets/53234826#53234826>

## Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)

- 發布時間：2023-09-30 21:29:41
- 原文連結：<https://ithelp.ithome.com.tw/articles/10331424>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 15 篇

![](https://ithelp.ithome.com.tw/upload/images/20230930/20120687OWotWHTFg3.png)

延續上一篇的內容，本文繼續跟大家分享一些正確觀念，為了就是在開發時可以撰寫出品質好的程式碼，寫的任何一個元件都很重要，它們為何存在，使用的優缺點是什麼，都應該清楚了解。如果是以好習慣寫出來的畫面，當然除了性能表現佳之外，後續需要解決的問題也會變少，是很值得前期重視的投資哦！

------------------------------------------------------------------------

## 謹慎使用 saveLayer()

1.  `saveLayer()` 也稱為**離屏渲染**，是引擎在針對某些情境處理渲染時會使用到的操作，本身屬於高成本、高耗時。
2.  主要是用來呈現各種 UI 視覺效果，**渲染形狀**、**裁剪**、**透明度**與**重疊效果**，有些都會使用到
3.  過程中會分配一個 `螢幕外緩衝區(off-screen buffer)`，並且將內容繪製到這裡，GPU 處理時會進行渲染目標的轉換，跳轉到另一個 Layer，導致運行緩慢\*\*\*\*
4.  有些 Widget 跟 Package 可能有在使用，過多的話造成 UI 卡頓，允許的話在使用前稍微閱讀過源碼會更有保障，否則會發現效能被拖慢的現象
5.  相關元件與操作
    - Opacity
    - ClipRRect
    - ShaderMask
    - ColorFilter
    - Chip → `disabledColorAlpha ≠ 0xff`
    - Text → `overflowShader`

> 提醒：可使用 Skia Screenshot 協助我們檢查渲染過程，詳細的說明可閱讀另一篇文章(等待上傳)

![](https://ithelp.ithome.com.tw/upload/images/20230930/20120687bsy5Fi3kM5.png)

### Opacity 操作

- 除非必要，否則減少使用
- 處理顏色的透明度，建議選用 `withOpacity()` 方法來添加不透明層

``` dart
Container(color: Colors.blue.withOpacity(0.5)),
ColoredBox(color: Colors.blue.withOpacity(0.6)),
Text('Hi!', style: TextStyle(color: Colors.blue.withOpacity(1))),

// Image
Image.network(
  'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
    opacity: _animationController,
),
Image.network(
  'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
    opacity: AlwaysStoppedAnimation(_animationController.value),
),
```

### Clipping 操作

1.  本身不會調用 `saveLayer()`，不會跟 Opacity \*\*\*\*一樣麻煩，但還是有成本，默認情況下裁剪被禁用為 `Clip.none` ，除非使用 `Clip.antiAliasWithSaveLayer`
2.  如果要有帶圓角的矩形，可以多使用 BoxDecoration 裡的 `borderRadius` 屬性去實現，而不要使用 ClipRRect 裁切矩形，實際上圖形引擎在處理的過程會比較輕鬆，性能比較好
3.  避免在動畫中進行裁剪，盡量在執行動畫之前先裁剪完成

``` dart
Container(
    width: 200,
    height: 200,
    decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(20),
    ),
),
```

### 檢測 saveLayer()

- App 元件，設置 `checkerboardOffscreenLayers` 為 true
- 檢查畫面上的元件是否有使用到 `saveLayer()` 相關操作，有的話會透過棋盤格呈現  
  ![](https://ithelp.ithome.com.tw/upload/images/20230930/20120687SviWtD2ph8.png)

## 使用 RepaintBoundary 重繪邊界

1.  緩存並防止不必要的繪製，有需要才動作，不會因其他狀態的刷新或改變而影響，提高性能。當只有一小部分元件需要刷新，而其他UI部分是靜態且固定的，這個情況很適合使用 `RepaintBoundary` 包裹不需要更新的元件，例如：動畫元件
2.  將內容繪製到螢幕外的緩衝區 (off-screen buffer) 接著進行合成到畫面，可以減少需要重繪的 View 數量。過程中會創建一個獨立的 `display list(一連串輸出圖像的命令)`，包含許多元件，可以將主要渲染元件與其他元件分割，不同 **Layer** 的分離，實現只繪製內容發生變化的 `subtree`，告訴 Flutter 這些元件應該在不同的 WidgetTree，處理自己的繪製，不會被其他不相關的繪製影響
3.  有助於限制 `markNeedsPaint()` 和 `paintChild()` 的使用，避免同一層的相關 RenderObject 被重新繪製。通常只要`child.isRepaintBoundary` 為 false，那麼就會執行 `paint` 方法，重新繪製子元件
4.  ListView 預設使用了 RepaintBoundary，當滾動列表的時候 item-widget 會保留且不再重新繪製

> 注意：Raster Cache 光柵緩存，創建成本高，會佔用大量 GPU 效能，濫用會造成過多的記憶體使用，因為需要緩存更多資訊

#### 另外

在 main 可以設置 `debugRepaintRainbowEnabled` 為 true，畫面會將元件透過顏色線條框起來，可幫助發現正在被繪製的區塊，有刷新的話線條顏色會一直變換。

### 相關檢測

- App 元件，設置 `checkerboardRasterCacheImages` 為 true
- 瀏覽圖片光柵緩存的情況，檢查有沒有給靜態圖像做緩存，沒有的話會導致每次 build 都重新繪製，以棋盤格呈現。
- 引擎會自動判斷圖像是否複雜到需要 RepaintBoundry，協助我們作出優化決策  
  ![](https://ithelp.ithome.com.tw/upload/images/20230930/20120687WlilX8gG4m.png)

## 模糊效果，使用 ImageFilter 代替 BackdropFilter

- 兩者都能實現模糊，但是 `ImageFilter` 的渲染速度更快
- 適當地搭配 `RepaintBoundry` ，以減少重新渲染模糊效果的頻率

``` dart
// Bad. BackdropFilter
Stack(
  children: [
    Image.asset(
        'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
        width: 50,
        height: 50,
    ),
    BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Container(
            color: Colors.grey.withOpacity(0.6),
        ),
    ),
  ],
),

// Good. ImageFiltered
Container(
    color: Colors.blue.withOpacity(0.5),
    child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Image.asset(
            'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
            width: 50,
            height: 50,
        ),
    ),
),
```

## 使用懶加載的 IndexedStack

如果是一般 TabBar 和 TabView，它會在首次加載時實體化所有頁面、元件，而對於多個頁面的情境，這可能會導致一開始載入或是跳轉的過渡動畫有嚴重卡頓，幀數過低。

以下範例的寫法可以只載入需要顯示的畫面元件，減少資源的消耗：

``` dart
late final List<bool> _pageActivateds = List<bool>.filled(4, false);

Widget build(BuildContext context) {
    _pageActivateds[widget.index] = true;

    final children = List.generate(
        _pageActivateds.length,
        (i) => _pageActivateds[i] ? pages[i] : const SizedBox(),
    );

    return IndexedStack(children: children);
}
```

> 相關套件：[lazy_load_indexed_stack](https://pub.dev/packages/lazy_load_indexed_stack/example)

## 準確地使用 GlobalKey

- GlobalKey 可以將元件的 **Element** 和 **RenderObject** 保存起來，即便元件已經從樹上離開了，只要轉移到其他的樹狀結構或是階層，它就能確保使用相同的 Element 和 RenderObject，所以 State 也會跟剛才一樣，不會被重置
- 對於會頻繁更換階層、消失又再次出現的元件，特別是很大的 Widget Tree，在這種情況下也許就適合給予一個 GlobalKey

``` dart
// FROM
final complextWidget = Container();

return isGood ? Container(child: complextWidget) : complextWidget,

// TO
final complextWidgetKey = GlobalKey();
final complextWidget = Container(key: complextWidgetKey);

return isGood ? Container(child: complextWidget) : complextWidget,
```

> 提醒：使用 GlobalKey 這個過程也稱為 **Tree Sugery**，很方便但也很危險，使用成本高，濫用的情況下會很大的影響效能，很可能會造成卡頓、不順暢

## 在 State 使用 dispose()

1.  釋放資源，避免記憶體洩漏，影響性能
2.  常用情境，使用 **TextEditingController**、**AnimationController**、**Ticker** 等等，在不需要時釋放
3.  `super.dispose()` 需作為最後一個執行函式，資源釋放需要在之前執行，如果在後面則不會處理

``` dart
@override
void dispose() {
    _animationController.dispose();

    super.dispose();
}
```

## 壓縮數據

進行數據壓縮後可有效節省記憶體，需要時再解壓縮並使用。如果需要將某些資料儲存到本地，例如：文件、SharedPreference 等等，可以先將資料壓縮後再儲存。不過，還是根據實際場景決定是否真的需要。

``` dart
final jsonString = await rootBundle.loadString('assets/food.json');

// compressed
final original = utf8.encode(jsonString);
final compressed = gzip.encode(original);

// decompressed
final decompressed = gzip.decode(compressed);
final jsonString = utf8.decode(decompressed);
```

## 使用 Isolates 處理複雜任務

當此任務在同步和非同步處理時可能會花很長且不可預期的時間，或是跟原生平台的互動，都適合使用 Isolate，例如：大量的文字解析、圖像處理、大型檔案的存取，都可能會堵塞 Main Isolate，影響到 Rendering Pipeline。適當地使用 Isolate 可以提升性能並優化整體的使用者體驗。

以下是簡易範例：

``` dart
void createIsolate() async {
    Isolate? isolate;
    ReceivePort receivePort = ReceivePort();

    try {
        isolate = await Isolate.spawn(_worker, receivePort.sendPort);
        receivePort.listen((dynamic message) {
        debugPrint(message.toString());
        });
    } catch (e) {
        debugPrint(e.toString());
    } finally {
        isolate?.addOnExitListener(receivePort.sendPort, response:  "isolate has been killed");
    }

    isolate?.kill();
}

void _worker(SendPort sendPort) {
    // Do complex task..
}
```

> 詳細的 Isolate 說明我有在另一篇文章提及，有興趣請點擊連結深入了解。  
> [Day 10: Async 和 Isolates 差異在哪裡？正確使用才能確保流暢體驗！](https://ithelp.ithome.com.tw/articles/10327324)

## 保持 Flutter 為最新版本

不要忘記持續追蹤 Flutter Repo，在每個版本中，Flutter 都進行了許多優化，以現在來看，近期都在處理 Dart 3、Impeller Renderer、Material 3、Widget API、Document，當然也包含很多原生平台的更新，效能持續提升，以整體來看大部分情境下是好處多的。同時呼籲大家更新後，如果有發現任何 Bug 問題，都不要吝嗇的發 Issue 到 Flutter Repo，大家的積極只會讓 Flutter 進步更快，我們共勉之。

``` dart
flutter upgrade
```

![Upgrade](https://i.imgur.com/pvCrmP6.gif)  
![](https://ithelp.ithome.com.tw/upload/images/20230930/201206870deFLmkM5e.png)

------------------------------------------------------------------------

## 總結

本文的 **saveLayer** 與 **RepaintBoundary** 操作都是 UI 的開發重點，如何以性能較好的方式去撰寫，需要養成習慣。而除了上述提到的內容大部分都與 UI 有關，也包含資料處理和 Isolate 使用，建議有時間的話，可以嘗試理解每個開發選擇和優化的由來，相信對於未來實作上的理解會更不一樣。

對於優化與觀念部分，喜歡的話請留言讓我知道，會在整理一些能幫助大家的內容。本系列已經到一半了，不覺得時間過很快嗎，休息放鬆一下，我們繼續加油！

## 延伸閱讀

- [Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)](https://ithelp.ithome.com.tw/articles/10330647)

## 參考與相關資源

- <https://api.flutter.dev/flutter/dart-ui/Canvas/saveLayer.html>
- <https://docs.flutter.dev/perf/best-practices>
- <https://blog.gskinner.com/archives/2022/09/flutter-rendering-optimization-tips.html?linkId=8208387>

---
