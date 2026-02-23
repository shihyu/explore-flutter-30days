# Day 49：Flutter Design Patterns（三）｜Behavioural Patterns 下集

> 原文來源：[Day 19：Flutter Design Patterns（三）｜Behavioural Patterns 下集](https://ithelp.ithome.com.tw/articles/10334216)

今天是 Design Pattern 的最後一集，但是 Design Patter 真的太多種了，沒辦法真的全部都介紹完，希望大家看完之後能對這些 Pattern 有一些感覺，能幫助你未來在看或是寫 code 的時候，更快抓到程式碼的要領。話不多說趕快開始吧


目錄：


- Observer Pattern

- Strategy Pattern

- Template Pattern

- Visitor Pattern

- Interpreter Pattern


## Flutter Design Patterns: — Observer Pattern


Observer Pattern 是一種行為設計模式，讓對象能夠觀察和監聽另一個對象的狀態變化，並在其狀態改變時作出反應。在 Flutter 中，這種模式可以用於許多場景，例如狀態管理、事件通知或數據綁定。


### 1. 什麼是 Observer Pattern？


Observer Pattern 的核心是允許多個觀察者物件監聽某一主題（或被觀察物件）的狀態變化。當主題的某些狀態發生變化時，它會通知所有已註冊的觀察者。


### 2. 如何在 Flutter 中使用 Observer Pattern？


在 Flutter 中，`Stream` 和 `StreamBuilder` 是 Observer Pattern 的經典實現，允許 Widget 監聽數據流的變化，並根據這些變化重新構建。


### 3.  中 Dart 的 Observer Pattern 實現：


**1. 創建一個 Stream 來代表被觀察的數據：**


```dart
class DataService {
final _dataController = StreamController.broadcast();

Stream get dataStream => _dataController.stream;

void updateData(String newData) {
_dataController.add(newData);
}

void dispose() {
_dataController.close();
}
}


```


**2. 使用 StreamBuilder 監聽數據流的變化：**


```dart
class DataObserverWidget extends StatelessWidget {
final DataService _dataService;

DataObserverWidget(this._dataService);

@override
Widget build(BuildContext context) {
return StreamBuilder(
stream: _dataService.dataStream,
builder: (BuildContext context, AsyncSnapshot snapshot) {
if (snapshot.hasError) {
return Text('Error: ${snapshot.error}');
} else if (!snapshot.hasData) {
return Text('Waiting for data...');
}
return Text('Data: ${snapshot.data}');
},
);
}
}


```


**3. 在 Flutter 應用中使用它：**


```dart
void main() {
runApp(MyApp());
}

class MyApp extends StatelessWidget {
final _dataService = DataService();

@override
Widget build(BuildContext context) {
return MaterialApp(
title: 'Observer Pattern Demo',
theme: ThemeData(
primarySwatch: Colors.blue,
),
home: Scaffold(
appBar: AppBar(title: Text('Observer Pattern in Flutter')),
body: DataObserverWidget(_dataService),
floatingActionButton: FloatingActionButton(
onPressed: () => _dataService.updateData(DateTime.now().toString()),
child: Icon(Icons.refresh),
),
),
);
}
}


```


在上述例子中，每次按下 FloatingActionButton，`DataService` 就會發送新的數據到其數據流中。`DataObserverWidget` 使用 `StreamBuilder` 監聽這些變化，並相應地更新 UI。


### 總結


Observer Pattern 在 Flutter 中提供了一種強大且靈活的方式來對狀態變化做出反應。透過使用 Flutter 提供的工具和構件，我們可以輕鬆地實現這一模式，使我們的 UI 保持同步並響應數據的變化。


## Flutter Design Patterns: — Strategy Pattern


Strategy Pattern 是一種行為型設計模式，它允許你在運行時根據不同的情境切換算法或策略。這種模式將算法的定義從使用它的對象中分離出來，使得算法可以獨立於使用它的客戶端進行變化。


### 1. 什麼是 Strategy Pattern？


Strategy Pattern 的主要思想是定義一組可插拔的策略或算法，並將每一種策略封裝在單獨的類中。這使得主要的功能可以根據不同的策略或算法進行變化，而不需要修改主要的功能。


### 2. 如何在 Flutter 中使用 Strategy Pattern？


在 Flutter 中，這種模式可以用於各種情境，例如根據不同的平台或設定選擇不同的渲染策略，或者根據使用者的選擇進行不同的動畫效果。


### 3. Flutter 的具體實現：


當你使用Flutter的動畫庫時，你可能會選擇不同的動畫策略，例如**`CurvedAnimation`**、**`Tween`**等。這些都可以看作是策略模式的實現，允許你使用不同的動畫策略而不更改實際的動畫代碼。


```dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
@override
Widget build(BuildContext context) {
return MaterialApp(
home: MyHomePage(),
);
}
}

class MyHomePage extends StatefulWidget {
MyHomePage({Key? key}) : super(key: key);

@override
_MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State with SingleTickerProviderStateMixin {
late AnimationController _controller;
late Animation _animation;

@override
void initState() {
super.initState();

_controller = AnimationController(
duration: const Duration(seconds: 2),
vsync: this,
);

// 選擇一個策略:
_setAnimationStrategy('tween');

_controller.forward();
}

void _setAnimationStrategy(String strategy) {
switch (strategy) {
case 'tween':
_animation = Tween(begin: 0.0, end: 100.0).animate(_controller);
break;
case 'curved':
_animation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
break;
// ... 更多策略可以在這裡添加
default:
throw ArgumentError('Unknown strategy: $strategy');
}
}

@override
Widget build(BuildContext context) {
return Scaffold(
appBar: AppBar(title: Text('Strategy Pattern in Animation')),
body: Center(
child: FadeTransition(
opacity: _animation,
child: FlutterLogo(size: 100),
),
),
);
}

@override
void dispose() {
_controller.dispose();
super.dispose();
}
}

```


### 4. Dart 中的 Strategy Pattern 實現：


**1. 定義策略接口：**


```dart
abstract class DrawingStrategy {
void drawContent();
}


```


**2. 實現具體的策略：**


```dart
class CircleDrawingStrategy implements DrawingStrategy {
@override
void drawContent() {
print('Drawing a circle...');
}
}

class SquareDrawingStrategy implements DrawingStrategy {
@override
void drawContent() {
print('Drawing a square...');
}
}


```


**3. 定義使用策略的上下文：**


```dart
class DrawingContext {
DrawingStrategy _strategy;

DrawingContext(this._strategy);

void setStrategy(DrawingStrategy strategy) {
_strategy = strategy;
}

void executeDraw() {
_strategy.drawContent();
}
}


```


**4. 在 Flutter 中使用策略模式：**


```dart
void main() {
// Using circle drawing strategy
DrawingContext drawingContext = DrawingContext(CircleDrawingStrategy());
drawingContext.executeDraw();

// Switch to square drawing strategy
drawingContext.setStrategy(SquareDrawingStrategy());
drawingContext.executeDraw();
}


```


在上述例子中，`DrawingContext` 提供了一個方法來設定和執行不同的繪圖策略。使用者可以在運行時切換策略，而不需要修改 `DrawingContext` 的代碼。


### 總結


Strategy Pattern 提供了一種靈活的方式來組織和管理具有不同行為的物件，並允許使用者在運行時更換行為。在 Flutter 中，這可以使你的代碼更加模組化，易於維護和擴展，同時也能提供一個更好的使用者體驗。


## Flutter Design Patterns: — Template Pattern


Template Pattern 是一種行為型設計模式，它在一個抽象類中定義了操作的算法框架，並將一些步驟的實現延遲到子類中。這允許子類在不改變算法結構的情況下，重新定義算法的某些步驟。


### 1. 什麼是 Template Pattern？


Template Pattern 的主要目的是提供一個算法的模板，其中某些步驟可以被子類覆蓋或實現，以提供算法特定部分的自定義功能。


### 2. 如何在 Flutter 中使用 Template Pattern？


Flutter widgets 就是一個很好的 Template 他們共同擁有生命周期的方法，如 **`initState`** , **`build`** , **`dispose`** 等。你通常會覆蓋這些方法來提供特定的行為，但背後的調用順序（即模板）由Flutter框架本身管理。再講道  Widget  本身如 `Scaffold` 就是用來呈現畫面的 Template 幫你定義好 `appbar`, `body` 等等


### 3. Dart 中的 Template Pattern 實現：


**1. 定義一個模板基類：**


```dart
abstract class AppPageTemplate {
void buildPage() {
showHeader();
showContent();
showFooter();
}

// Template methods
void showHeader() {
print('Default Header');
}

void showContent();

void showFooter() {
print('Default Footer');
}
}


```


**2. 實現具體的 Template 子類：**


```dart
class HomePage extends AppPageTemplate {
@override
void showContent() {
print('Home Page Content');
}
}

class SettingsPage extends AppPageTemplate {
@override
void showHeader() {
print('Settings Page Header');
}

@override
void showContent() {
print('Settings Page Content');
}
}


```


**3. 在 Flutter 中使用 Template 模式：**


```dart
void main() {
final homePage = HomePage();
homePage.buildPage();

print('\\n');

final settingsPage = SettingsPage();
settingsPage.buildPage();
}


```


在上述例子中，`AppPageTemplate` 定義了一個標準的頁面構建方法，其中 `showContent` 是抽象的，必須由子類實現。其他像 `showHeader` 和 `showFooter` 提供了預設的實現，但也可以被子類覆蓋。


### 總結


Template Pattern 在 Flutter 中提供了一種有效的方式，將通用的操作流程封裝在基類中，同時允許子類自定義或覆蓋某些部分。這不僅確保了算法的一致性，還提供了很大的靈活性，使得擴展和定製變得非常簡單。


## Flutter Design Patterns: — Visitor Pattern


Visitor Pattern 是一種行為型設計模式，它允許你在不修改已存在的類的情況下，增加新的操作。這種模式涉及到兩組對象，一組是需要提供操作的元素，另一組則是訪問者，它執行操作。


### 1. 什麼是 Visitor Pattern？


Visitor Pattern 的主要思想是將數據結構和對其操作的邏輯分開。這允許數據結構保持相對穩定，同時能夠在其上簡單地添加新的操作。


### 2. 如何在 Flutter 中使用 Visitor Pattern？


在 Flutter 中，這種模式特別適用於當你需要在一組 Widget 上執行相似的操作時，如渲染、更新或檢查。


### 3. Flutter 的具體實現：


在 Flutter RenderObject 裡面就有一個相當有趣的方法叫做 `visitChildren`。`visitChildren` 裡面的方法有一個 `vistor`。


在某些情況下，框架或開發者可能需要遍歷渲染樹的某一部分。例如，當檢測哪一部分 UI 需要重繪時，或者當收集有關渲染樹的 debug 訊息。這時候就可以透過 visitor  把所有在這底下的渲染數都走過一遍。只需要特別注意，他不能在 build 的過程中使用，因為這段期間整棵樹可能還沒被建立好，或是會正在被更新。


```dart
abstract class RenderObject {
...
void visitChildren(RenderObjectVisitor visitor) { }
...
}


```


### 4. Flutter 中的 Visitor Pattern 實現：


**1. 定義元素和訪問者接口：**


```dart
abstract class Element {
void accept(Visitor visitor);
}

abstract class Visitor {
void visitConcreteElementA(ConcreteElementA element);
void visitConcreteElementB(ConcreteElementB element);
}


```


**2. 實現具體的元素：**


```dart
class ConcreteElementA implements Element {
@override
void accept(Visitor visitor) {
visitor.visitConcreteElementA(this);
}

String specificOperationA() => 'ElementA operation';
}

class ConcreteElementB implements Element {
@override
void accept(Visitor visitor) {
visitor.visitConcreteElementB(this);
}

String specificOperationB() => 'ElementB operation';
}


```


**3. 實現具體的訪問者：**


```dart
class ConcreteVisitor implements Visitor {
@override
void visitConcreteElementA(ConcreteElementA element) {
print('Visited by ConcreteVisitor: ${element.specificOperationA()}');
}

@override
void visitConcreteElementB(ConcreteElementB element) {
print('Visited by ConcreteVisitor: ${element.specificOperationB()}');
}
}


```


**4. 在 Flutter 中使用訪問者模式：**


```dart
void main() {
List elements = [ConcreteElementA(), ConcreteElementB()];
Visitor visitor = ConcreteVisitor();

for (var element in elements) {
element.accept(visitor);
}
}


```


在上述例子中，我們定義了兩個具體的元素 `ConcreteElementA` 和 `ConcreteElementB`，以及一個具體的訪問者 `ConcreteVisitor`。當訪問者訪問一個元素時，該元素的特定操作被調用。


### 總結


Visitor Pattern 提供了一種在不修改元素類的前提下，擴展其操作的方法。在 Flutter 中，這允許你創建高度靈活和可擴展的 Widget，這些 Widget 可以輕鬆地接受新的操作或行為，而不需要修改原始代碼。


## Flutter Design Patterns: — Interpreter Pattern


Interpreter Pattern 是一種行為型設計模式，它提供了評估語言中的句子的方式，主要用於表示和解釋固定語法結構的語言。這種模式涉及到表示文法的定義，以及該文法語言中句子的解釋器。


### 1. 什麼是 Interpreter Pattern？


Interpreter Pattern 主要用於定義文法表示和如何解釋其句子。它適用於那些語法結構固定的語言。


### 2. 如何在 Flutter 中使用 Interpreter Pattern？


在 Flutter 應用中，這種模式可以用於解釋如樣式、主題或 Widget 結構等的簡單語言描述。例如，一個簡單的布局語言可以使用解釋器模式來渲染相對應的 Widget。


### 3. Flutter 中的 Interpreter Pattern 實現：


**1. 定義抽象表達式和文法規則：**


```dart
abstract class Expression {
bool interpret(String context);
}

class TerminalExpression implements Expression {
final String data;

TerminalExpression(this.data);

@override
bool interpret(String context) {
return context.contains(data);
}
}

class OrExpression implements Expression {
final Expression expr1;
final Expression expr2;

OrExpression(this.expr1, this.expr2);

@override
bool interpret(String context) {
return expr1.interpret(context) || expr2.interpret(context);
}
}


```


**2. 使用上述定義的文法規則：**


```dart
Expression getMaleExpression() {
Expression robert = TerminalExpression("Robert");
Expression john = TerminalExpression("John");
return OrExpression(robert, john);
}

void main() {
Expression isMale = getMaleExpression();
print("John is male? ${isMale.interpret("John")}");
print("Julie is male? ${isMale.interpret("Julie")}");
}


```


在這個例子中，我們使用了 `OrExpression` 來組合 `TerminalExpression`，表示 "John" 或 "Robert"。`getMaleExpression` 創建了一個該文法的句子，表示男性的名字。然後，我們可以用 `interpret` 方法來檢查給定的名稱是否為男性。


### 總結


Interpreter Pattern 適用於解釋簡單語言的情境，尤其是當我們需要頻繁地變更或擴展該語言時。在 Flutter 中，雖然我們可能不經常使用此模式，但對於自定義語言或格式的解析，它可能是一個很好的選擇。


## 大總結


經過這兩篇深入的探索，我們對 Flutter 中的行為模式有了更全面的認識。從 Observer Pattern 的動態響應能力，到 Strategy Pattern 的策略封裝，再到 Template Pattern 的結構化框架，每個模式都對應了特定的問題並提供了獨特的解決方案。而 Visitor 和 Interpreter Pattern 則展現了在特定場景下的動態解析和運算的能力。這些模式不僅是理論知識，更是實際開發中的寶貴工具。


希望透過這些分享，你能夠在你的 Flutter 旅程中更順利、更有效地構建和優化你的應用。期待在下一篇文章中與大家再度相遇，繼續探討更多關於 Flutter 的深入主題！
