# Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！

- 發布時間：2023-09-17 19:49:43
- 原文連結：<https://ithelp.ithome.com.tw/articles/10320379>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 2 篇

![](images/20120687mm11qSGYxL.png)

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
