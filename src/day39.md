# Day 39：@@ 這個是什麼？｜Flutter MetaData

> 原文來源：[Day  9：@@ 這個是什麼？｜Flutter MetaData](https://ithelp.ithome.com.tw/articles/10325980)

在經過幾天精實的戰鬥，走過包含 CI/CD 和 Clean Architecture，今天來聊點輕鬆的話題，在 Flutter 開發的過程中，相信你一定有用過如 `@required`、`@override` 這類的東西。那你有沒有想過這些 annotation 是如何運作的呢？或是你自己能不能實現相關的功能？今天假日就來一記 @@ 大補貼吧！


## 引言:


嗨，各位 Flutter 開發者！還記得那幾天的 CI/CD 戰役和 Clean Architecture 的探索嗎？那段時間真的是技術滿載，但今天，我想和大家分享的是一個或許你每天都在使用，卻不太曉得其背後運作原理的小細節 —— Annotation（註解）。你是否也曾對 `@required`、`@override` 這些常見的標記感到好奇？那麼，就讓我們在這個假日，深入探索這些神秘而有趣的注解，一起來補充一下知識吧！


首先我們要知道的是，大部分的 annotation 其實沒有辦法對程式碼起到實際的作用，他的用途是讓 Dart analyzer 知道，如果針對哪些情況應該顯示提醒或是錯誤或其他處理。而在這之中只有 [@Deprecated](https://api.dart.dev/stable/dart-core/deprecated-constant.html), [@deprecated](https://api.dart.dev/stable/dart-core/deprecated-constant.html), [@override](https://api.dart.dev/stable/dart-core/override-constant.html), 和 [@pragma](https://api.dart.dev/stable/dart-core/pragma-class.html)，是 dart 原生的處理器就可以使用，其他都是必須自行新增，或是添加對應的 package。


### Deprecated


`@Deprecated` 和 `@depracted`，這兩個所代表的意義一樣，只差別在 `@Deprecated`要多帶一個參數表示提示。官方建議不要再使用 `@depracted` 會更人性化


```dart
class Television {
/// Use [turnOn] to turn the power on instead.
@Deprecated('Use turnOn instead')
void activate() {
turnOn();
}

/// Turns the TV's power on.
void turnOn() {...}
// ···
}

```


### Override


`override` 相信大家已經非常熟悉，就是用來提示哪些方法需要被 `override`。


```dart
class Animal {
void eat();
}

class Pig extends Animal {
@override
void eat();
}

```


### Pragma


Pragma 可能是大家相對陌生一點點的，`@pragma` 是用于向編譯器傳達某些訊息或特定的指令，一般來說在開發 App 的過程中不會去使用到，不過如果你最近有使用到 firebaseMessaging 的話，應該會發現他在設定時，有提醒你要加上這一行 `@pragma('vm:entry-point')`。


![](https://ithelp.ithome.com.tw/upload/images/20230924/20117363kKzj1wmxyX.png)


由於 dart 支援 AOT 的特性， `@pragma('vm:entry-point')` 可以用於指示這個函數是某個 vm 的入口，即使沒有被其他程式呼叫，也必須要保留。像上面 firebaseMessaging 的例子，這裡的 _firebaseMessagingBackgroundHandler 就是給 native 呼叫的入口，所以在編譯時可能會因為沒有被呼叫到而被丟棄。為了要在編譯後也能保留，所以必須加上  `@pragma('vm:entry-point')` 。


除了常用的 `@pragma('vm:entry-point')` ，事實上還有須多如：


- **`dart2js:tryInline`**: 一個提示，建議dart2js編譯器內聯（inline）該方法。不過，編譯器並不總是遵循這些建議。

```dart
dartCopy code
@pragma('dart2js:tryInline')
void myFunction() {...}


```

- **`dart2js:noInline`**: 告訴dart2js編譯器不要內聯該方法。

```dart
dartCopy code
@pragma('dart2js:noInline')
void anotherFunction() {...}


```

- **`dart2js:noElision`**: 防止dart2js移除不變的構造函數。

- **`dart2js:noSideEffects`**: 表明該方法沒有副作用。

- **`vm:prefer-inline`**: 類似於**`dart2js:tryInline`*，但是是針對Dart VM的。


但這些在一般 Flutter 的開發大多碰不上，只當作有趣的小知識補充一下。


事實上，如果你想要創建自己的 annotation 其實也不困難，只需要先定義自己的 class。


```dart
class Todo {
final String who;
final String what;

const Todo(this.who, this.what);
}

```


然後你就能在任何地方使用它，不過就像我們上面提到，新增這些 annotation 並不會在 dart 解析時產生任何影響，只是一個標注而已，如果要讓他產生作用必須配合 `GeneratorForAnnotation`，不過這不是本篇章的重點，我們可以之後再展開討論。


```dart
@Todo('Dash', 'Implement this function')
void doSomething() {
print('Do something');
}

```


那除了上述四種基本 MetaData 以外，其他我們常用的 metadata 或是說 annotation 其實是定義在 dart package [meta](https://pub.dev/packages/meta) 裡面的。裡面包含


- **`@required`**
這個註解用於標記名為參數的必填參數。當一個函數的參數被註解為 **`@required`** 時，呼叫該函數而不提供該參數的值會導致分析器發出警告。

- **`@immutable`**
當你想要確保一個類的所有實例字段都是 **`final`** 的時候，可以使用這個註解。當一個類被註解為 **`@immutable`** 但含有非 **`final`** 字段時，會在靜態分析時收到警告。

- **`@literal`**
這個註解是用來標記構造器或函數，表示它們期望的參數是常數。這有助於強調和驗證在編寫代碼時使用的值應為常數。

- **`@protected`**
當你希望一個成員只能在當前類或其子類中被訪問時，可以使用這個註解。該註解僅作為文檔使用，實際的行為需要由 Dart 的 **`protected`** 修飾符來控制。

- **`@sealed`**
這個註解是用於標記一個類，表示它不應該被外部擴展或實現。任何外部的代碼嘗試擴展或實現這個類都會導致分析器發出警告。

- **`@visibleForTesting`**
當你有一些程式碼只為了測試而公開，而在正常的使用中不應該被訪問，可以使用這個註解。


如果你對其他的內容有興趣，可以看看他們的 [changelog](https://pub.dev/packages/meta/changelog) 裡面，可以找到其他的介紹。


## 結語:


從 `@Deprecated` 到 `@visibleForTesting`，這些 annotation 背後所隱藏的小秘密，或許讓我們對 Flutter 有了更深入的了解。知道它們的運作原理和用途，不僅可以幫助我們更有效地利用這些工具，更可以為我們在未來的開發路上帶來許多方便。希望這篇分享對你有所幫助，也期待在 Flutter 的世界中，我們能持續學習、進步。感謝你的陪伴，我們下次見！
