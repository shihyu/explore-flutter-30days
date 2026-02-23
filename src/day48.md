# Day 48：Flutter Design Patterns（二）｜Behavioural Patterns 上集

> 原文來源：[Day 18：Flutter Design Patterns（二）｜Behavioural Patterns 上集](https://ithelp.ithome.com.tw/articles/10333120)

# Day 18：Flutter Design Patterns（二）｜Behavioural Patterns 上集


昨天跟大家複習了基本的 **Structural Patterns**，今天繼續前往下一個目標 **Behavioural Patterns** 。 Behavioural 顧名思義就是有關於行為，這些 Pattern 主要想解決的問題在於物間之間的互動和他們職責的分配。確保每個物件在互動中能夠各自解耦，提高程式碼的靈活性。那馬上開始吧～🐴


目錄：


- Memento Pattern

- Chain of Responsibility Pattern

- Command Pattern

- Iterator Pattern

- Mediator Pattern

- State Pattern


## Flutter Design Patterns: — Memento


Memento 設計模式提供了對對象的內部狀態的保存和恢復，而不暴露對象的內部結構。在許多情境中，如撤銷/重做操作、保存和載入遊戲等，Memento 模式都非常有用。


在 Flutter 中，這種模式可以用於保存和恢復應用的狀態。


### 1. 什麼是 Memento Design Pattern？


Memento 模式的主要目的是保存一個對象的某一個狀態，以便在未來某一時間點恢復它。


### 2. 如何在 Flutter 中使用 Memento？


在 Flutter 中，可以使用此模式來保存和恢復應用的某些狀態，例如文本編輯器的撤銷/重做功能。


### 3. Flutter 的具體實現：


在 Flutter 中有一個比較少人用過的 **`restorationId`**，他可以用來標示 Widget 並且允許保存某些狀態，後面也許有機會特別開一期來講解。


### 4. Dart 中的 Memento 實現：


考慮一個簡單的文字編輯器，其中有撤銷操作的需求。


**1. Memento 類和 Caretaker 類：**


```dart
class Memento {
final String textState;

Memento(this.textState);
}

class Caretaker {
List _history = [];
int _current = -1;

void saveState(Memento memento) {
_history = _history.sublist(0, _current + 1); // Remove future states if we undo
_history.add(memento);
_current++;
}

Memento undo() {
if (_current > 0) {
_current--;
return _history[_current];
}
return null;
}

Memento redo() {
if (_current

## Flutter Design Patterns: — Chain of Responsibility


Chain of Responsibility 是一種行為設計模式，其主要目的是使多個物件都有機會處理特定的請求，從而解除發送者和接收者之間的耦合。此鏈結由多個處理物件組成，每個物件都包含了邏輯以判斷是否能夠處理該請求；如果能夠處理，則處理請求，否則將其傳遞給下一個物件。


### 1. 什麼是 Chain of Responsibility Pattern？


這種模式的概念是，通常每個接收物件都包含對另一個接收物件的引用。如果一個物件不能處理該請求，則將請求傳遞給下一個接收者，如此等等。


### 2. 如何在 Flutter 中使用 Chain of Responsibility？


在 Flutter 中，此模式可以用於處理事件、手勢或者消息。例如，當一個手勢在 Widget 樹中被檢測到時，它可能會首先被某個 Widget 處理，如果該 Widget 不消耗該事件，它將被傳遞到Widget 樹中的其他 Widget。


### 3. Flutter 的具體實現：


在 Flutter 的 Event 中，當我們接收到從 native 端傳過來的觸碰事件，Flutter  會通過 `hitTest` 來檢查當前的 widget 是否有被點擊。


```dart
bool hitTest(HitTestResult result, { required Offset position }) {
if (_size!.contains(position)) {
if (hitTestChildren(result, position: position) || hitTestSelf(position)) {
result.add(BoxHitTestEntry(this, position));
return true;
}
}
return false;
}

```


這一機制是通過 `RenderObject` 和 `HitTestResult` 來實現的。每個 `RenderObject` 都有一個 `hitTest` 方法，用於確定是否與特定位置匹配。一旦找到一個匹配的 `RenderObject`，就會將事件添加到 `HitTestResult` 的結果列表中，然後按照列表的順序進行處理。


這解決了我剛開始寫 Flutter 的疑惑，為什麼點擊的行為要叫做 `HitTestBehavior` ，原來test 是指 widget 所在的位置有沒有被點擊到呀。


### 4. Dart 中的 Chain of Responsibility 實現：


考慮一個情境，我們有多個日誌記錄器，每個記錄器都記錄不同級別的日誌。


**1. 抽象 Handler：**


```dart
abstract class Logger {
final int level;
Logger? nextLogger;

Logger(this.level);

void setNextLogger(Logger nextLogger) {
this.nextLogger = nextLogger;
}

void logMessage(int level, String message) {
if (this.level

## Flutter Design Patterns: — Command Pattern


Command Pattern 是一種行為設計模式，其主要目的是將一個請求封裝成一個物件，從而使你可以使用不同的請求參數化其他物件，並支援請求的排隊或記錄功能。這可以有效地解除發送者和接收者之間的耦合。


### 1. 什麼是 Command Pattern？


這種模式的概念是，它將一個操作（命令）封裝成一個物件。這使得我們可以將參數化的命令、請求排隊或記錄，甚至支援撤銷功能。


### 2. 如何在 Flutter 中使用 Command Pattern？


在 Flutter 中，此模式可以用於處理按鈕點擊、手勢或任何其他事件。例如，當用戶點擊按鈕時，不直接執行一個操作，而是可以創建一個命令對象，然後執行它。或像是 Future 或是 Stream 他們都是封裝了異步的操作，成為一個可以被隨時命令執行的對象。


### 3. Flutter 的具體實現：


在這裡我們就可以看到 computation 就是一個命令，而 Future 是執行該命令的一種機制，就是一個很直觀的 Command Pattern。


```dart
factory Future(FutureOr computation()) {
_Future result = new _Future();
Timer.run(() {
try {
result._complete(computation());
} catch (e, s) {
_completeWithErrorCallback(result, e, s);
}
});
return result;
}

```


### 4.  Dart 中的 Command Pattern 實現：


考慮一個情境，我們想要為按鈕創建多個操作（命令）。


**1. 命令接口：**


```dart
abstract class Command {
void execute();
}


```


**2. 具體的命令：**


```dart
class OpenCommand implements Command {
@override
void execute() {
print("Opening the document");
}
}

class SaveCommand implements Command {
@override
void execute() {
print("Saving the document");
}
}


```


**3. 調用者 (Invoker)：**


```dart
class Button {
Command command;

Button(this.command);

void press() {
command.execute();
}
}


```


**4. 使用 Command：**


```dart
void main() {
Command openCommand = OpenCommand();
Command saveCommand = SaveCommand();

Button openButton = Button(openCommand);
Button saveButton = Button(saveCommand);

openButton.press();  // Outputs: Opening the document
saveButton.press();  // Outputs: Saving the document
}


```


在上述例子中，按鈕不需要知道具體的操作，它只需要知道如何執行命令。


### 總結


Command Pattern 在 Flutter 中提供了一種方式，可以將操作封裝為物件，從而使我們可以定義新的命令而無需修改現有代碼。這使得系統變得更靈活，並且可以輕鬆擴展。


## Flutter Design Patterns: — Iterator Pattern


Iterator Pattern 是一種行為設計模式，它提供了一個方法來訪問集合物件的元素，而不需要公開其底層表示。此模式為集合物件提供一個統一的接口，使得集合中的項目可以被順序地遍歷，而不考慮其具體的實現。


### 1. 什麼是 Iterator Pattern？


Iterator 模式的核心思想是將集合物件的遍歷操作從集合本身分離出來，使用一個迭代器物件來實現。這不僅保護了集合的內部結構，而且為遍歷不同的集合提供了一個統一的接口。


### 2. 如何在 Flutter 中使用 Iterator Pattern？


在 Flutter 中，許多集合類，如 List、Set ，都實現了 Iterator Pattern，讓我們能夠方便地遍歷集合中的項目。


### 3. Flutter 的具體實現：


在 Flutter 中其實就有 `Iterable` 裡面就完整實現了 Iterator Pattern。在他就清楚的定義了要實現 `moveNext`，和 current。


```dart
part of dart.core;

abstract interface class Iterator {
bool moveNext();
E get current;
}

```


小知識 💡 泛型通常會用 T 表示，這裡會用 E 通常代表裡面是 Element，而 T 更強調他是 Type。有寫地方可能會使用 K, V 代表 Key and Value 如 Map<K, V>


我們用的 List 和 Set 都是繼承自 `EfficientLengthIterable`，也就是多紀錄 length 的 `Iterable`，可以讓繼承他的類型快速取得如： List.last ，可以在某些方面優化列表的速度。


```dart
abstract class EfficientLengthIterable extends Iterable {
const EfficientLengthIterable();
/**
* Returns the number of elements in the iterable.
*
* This is an efficient operation that doesn't require iterating through
* the elements.
*/
int get length;
}

```


### 4. Dart 中的 Iterator Pattern 實現：


考慮一個情境，我們有一個書籍集合，想要使用迭代器順序遍歷其中的書籍。


**1. 集合接口：**


```dart
abstract class BookCollection {
Iterator createIterator();
}

class Book {
final String title;

Book(this.title);
}


```


**2. 具體的集合：**


```dart
class BookShelf implements BookCollection {
List books = [];

void addBook(Book book) {
books.add(book);
}

@override
Iterator createIterator() {
return books.iterator;
}
}


```


**3. 使用 Iterator：**


```dart
void main() {
BookShelf bookShelf = BookShelf();

bookShelf.addBook(Book("Flutter for Beginners"));
bookShelf.addBook(Book("Advanced Flutter"));
bookShelf.addBook(Book("Flutter Design Patterns"));

Iterator iterator = bookShelf.createIterator();

while (iterator.moveNext()) {
print(iterator.current.title);
}
}


```


上述代碼首先創建了一個 `BookShelf` 和添加了幾本書籍。然後，我們使用 `BookShelf` 提供的 `createIterator()` 方法獲得書籍的迭代器，並順序打印書名。


### 總結


Iterator Pattern 提供了一種統一的方法來遍歷集合物件，使得我們不需要關心集合的具體實現。Flutter 的核心集合框架已經內建了這種模式，使我們可以輕鬆地遍歷集合項目。


## Flutter Design Patterns: — Mediator Pattern


Mediator Pattern 是一種行為設計模式，其主要目的是減少多個類之間的通訊複雜性，這是通過將這些類的通訊放在一個中介物件中完成的。當多個類彼此相互通訊時，形成了一個網狀結構，而中介者模式會將網狀結構轉換為星形結構，減少了類之間的直接互動。


### 1. 什麼是 Mediator Pattern？


Mediator Pattern 的核心思想是將物件之間的通訊封裝在一個中介物件中。每個物件都不會直接與其他物件通訊，而是通過中介者進行通訊。這減少了物件之間的依賴性，並將通訊邏輯集中在一個地方。


### 2. 如何在 Flutter 中使用 Mediator Pattern？


在 Flutter 應用程序中，此模式可以用於組件之間的通訊，例如當多個 Widget 需要通過某個共享的邏輯或狀態進行交互。我們常用的 Riverpod 或是 BLoC 或多或少都是這個 Patter 的實踐者。


### 3. Dart 中的 Mediator Pattern 實現：


考慮一個情境，我們有兩個小部件，分別代表增加按鈕和減少按鈕，它們需要更新一個共享的數字。


**1. Mediator：**


```dart
class Mediator {
int _value = 0;

Function? notifyListeners;

void increment() {
_value++;
notifyListeners?.call();
}

void decrement() {
_value--;
notifyListeners?.call();
}

int get value => _value;
}


```


**2.** Widget **使用 Mediator：**


```dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
final mediator = Mediator();

@override
Widget build(BuildContext context) {
mediator.notifyListeners = () => setState(() {});

return MaterialApp(
home: Scaffold(
body: Center(
child: Column(
mainAxisSize: MainAxisSize.min,
children: [
ElevatedButton(
onPressed: mediator.increment,
child: Text("Increment"),
),
Text("${mediator.value}"),
ElevatedButton(
onPressed: mediator.decrement,
child: Text("Decrement"),
),
],
),
),
),
);
}
}


```


上述代碼中，`Mediator` 管理一個數值並提供增加和減少的方法。Flutter 應用中的兩個按鈕（增加和減少）使用此中介者進行通訊和互動。


### 總結


Mediator Pattern 在 Flutter 中可以幫助我們減少部件之間的直接依賴，並將通訊邏輯集中在一個中介物件中。這提供了更清晰、更有組織的方式來管理部件間的交互，特別是當有多個部件需要互相通訊時。


## Flutter Design Patterns: — State Pattern


State Pattern 是一種行為設計模式，它允許一個物件在其內部狀態改變時改變其行為。這意味著該物件將看起來好像修改了其類型。通過將每個狀態封裝成獨立的類，並將動作委派到代表當前狀態的物件，我們可以使物件的狀態逻辑更加有組織和彈性。


### 1. 什麼是 State Pattern？


State Pattern 的主要思想是允許一個物件在其內部狀態改變時改變其行為，而無需改變物件的類或其主要功能。這是通過將狀態相關的行為封裝在單獨的類中來實現的。


### 2. 如何在 Flutter 中使用 State Pattern？


在 Flutter 中，`StatefulWidget` 和其相關的 `State` 類實際上已經是 State Pattern 的一個實現。每當 Widget 的狀態更改時，Flutter 會重新構建小部件，從而反映新的狀態。


### 3.  Dart 中的 State Pattern 實現：


考慮一個情境，我們有一個音樂播放器，它有多種狀態，如播放、暫停和停止。


**1. State 接口：**


```dart
abstract class PlayerState {
void play();
void pause();
void stop();
}


```


**2. 具體的狀態：**


```dart
class PlayingState implements PlayerState {
@override
void play() {
print("Already playing");
}

@override
void pause() {
print("Pausing the player");
}

@override
void stop() {
print("Stopping the player");
}
}

class PausedState implements PlayerState {
@override
void play() {
print("Resuming playback");
}

@override
void pause() {
print("Already paused");
}

@override
void stop() {
print("Stopping the player from paused state");
}
}


```


**3. Context 類（MusicPlayer）：**


```dart
class MusicPlayer {
PlayerState _state;

MusicPlayer(this._state);

set state(PlayerState state) {
_state = state;
}

void play() {
_state.play();
}

void pause() {
_state.pause();
}

void stop() {
_state.stop();
}
}


```


**4. 使用 State Pattern：**


```dart
void main() {
MusicPlayer player = MusicPlayer(PlayingState());

player.play();
player.pause();
player.stop();

player.state = PausedState();
player.play();
}


```


在上述例子中，`MusicPlayer` 根據其當前狀態（由 PlayerState 的具體實現表示）對 play、pause 和 stop 的行為進行反應。


### 總結


State Pattern 在 Flutter 中提供了一個結構化的方式來處理物件的不同狀態和相關的行為。這不僅使代碼更有組織，而且提供了一種靈活的方法來擴展和修改狀態相關的行為，而無需修改現有的類或引入大量的條件語句。


## 大總結


經過今天的分享，我們已經深入探討了 Behavioural Patterns 的上集，包括 Memento Pattern、Chain of Responsibility Pattern、Command Pattern、Iterator Pattern、Mediator Pattern 與 State Pattern。每一種 Pattern 都提供了獨特的方法來管理物件之間的互動和職責的分配，從而讓程式碼保持靈活，且能更有效地解耦各物件的互動。


回想今天介紹的每一種模式，我們可以看到它們如何協助開發者在面對不同的程式設計問題時，能夠找到合適的解決策略。透過這些 Patterns，Flutter 開發不僅更具組織性，而且能夠更快速地應對變化。


希望大家能夠將今天學到的知識運用到自己的 Flutter 開發之中，並有效地解決各種實際的設計問題。明天，我們將繼續探索 Behavioural Patterns 的下集，期待與大家再次交流！


祝各位開發順利，我們下次再見！👋🚀
