# Day 47：Flutter Design Patterns（一）｜Structural  Patterns

> 原文來源：[Day 17：Flutter Design Patterns（一）｜Structural  Patterns](https://ithelp.ithome.com.tw/articles/10333108)

在前幾天講解 Clean Architecture 的第一期，我們有跟大家分享了 SOLID 的 Design Principles，大家應該還意猶未盡吧！今天就再來一期大補帖，一起來整理 常用的 Structural  Patterns 並用 Dart 語言做為輔助，一起來學習吧！


**目錄**


- Facade

- Adapter

- Composite

- Flyweight

- Proxy

- Bridge


## Flutter Design Patterns: — Facade


Facade（外觀）設計模式提供了一個統一的接口，這個接口使得一組接口更易於使用。Facade 定義了一個高級的接口，這個接口使得這一子系統更加容易使用。


在 Flutter 中，這種模式有助於封裝多個小部件或功能的復雜性，並提供一個簡單的API。


### 1. 什麼是 Facade Design Pattern？


Facade 模式的主要目的是隱藏系統的復雜性，並提供一個給客戶端的接口。它不增加新的功能，而是使用現有的功能，並簡化了對它們的訪問。


### 2. Flutter 的具體實現：


在Flutter中，常使用的facade模式是 `WidgetsFlutterBinding.ensureInitialized()` 。當你使用 `runApp()` 啟動應用程式時，它會確保有必要的 binding 到底層，使用時並不需要關心底層的實現細節，只需要確保他完成即可。


### 3.  Dart 中的 Facade 實現：


在 Dart 中，Facade 模式可以用於封裝那些需要多步驟才能完成的任務，如數據庫操作、網絡請求等，使得這些操作更易於使用。


假設我們有一個應用程式，它需要從API獲取數據、解析這些數據並在本地數據庫中保存它們。而 Facade 就可以簡化這些操作。


**1. 子系統：**


```dart
class FetchData {
String getDataFromAPI() {
return "Data from API";
}
}

class DataParser {
String parseData(String data) {
return "Parsed $data";
}
}

class DatabaseSaver {
void saveToDatabase(String parsedData) {
print('Saving $parsedData to database...');
}
}


```


**2. Facade ：**


```dart
class DataFacade {
final FetchData fetchData = FetchData();
final DataParser dataParser = DataParser();
final DatabaseSaver databaseSaver = DatabaseSaver();

void fetchDataAndSave() {
String data = fetchData.getDataFromAPI();
String parsedData = dataParser.parseData(data);
databaseSaver.saveToDatabase(parsedData);
}
}

```


使用：


```dart
void main() {
DataFacade dataFacade = DataFacade();
dataFacade.fetchDataAndSave();
}

```


上述程式將輸出：


```
Saving Parsed Data from API to database...

```


### 總結


Facade 設計模式提供了一種機制，可以輕鬆訪問在Flutter應用程序中的複雜的邏輯或多個步驟的功能。通過使用這種模式，我們可以保護客戶端免受那些不必要的複雜性，並提供一個清晰簡單的接口，這也使得代碼更加整潔和可維護。


## Flutter Design Patterns: — Adapter


當我們需要讓兩個不相容的接口能夠一起工作時，Adapter（適配器）設計模式就發揮了它的作用。這是一個結構型設計模式，主要目的是使不相容的接口能夠一起工作。


在 Flutter 中，這種模式可以幫助我們整合早期或外部系統的代碼，或簡單地使我們的接口更具有可重用性和可擴展性。


### 1. 什麼是 Adapter Design Pattern？


Adapter 模式允許已存在的對象使用不同的接口，從而使其與其他對象一起工作，這些對象的接口可能與我們的期望不符。最常被拿來比喻的對象就是多國插座，需要一個轉接頭 (Adapter) 讓這些電器可以正常運轉。


### 2. 如何在 Flutter 中使用 Adapter？


在 Flutter 中，這種模式可以用於多種情況，例如使第三方函數庫與我們的應用程式代碼兼容，或將早期版本的 Flutter 應用程式進行升級。


### 3. Dart 中的 Adapter 實現：


假設你在 Flutter 中使用了一個第三方插件，這個插件回傳的是 `ThirdPartyUser`。但你的應用中的其他部分需要一個不同的對象格式。你可以建立一個Adapter來轉換從插件中獲得的對象，使其符合你的需求。


**1. 假設你使用的第三方插件返回以下格式的用戶數據:**


```dart
class ThirdPartyUser {
final String name;
final int age;

ThirdPartyUser({required this.name, required this.age});
}

```


**但你的應用需要以下格式:**


```dart
class AppUser {
final String fullName;
final String info;

AppUser({required this.fullName, required this.info});
}

```


**2. Adapter 類：**


```dart
class UserAdapter {
static AppUser adapt(ThirdPartyUser user) {
return AppUser(
fullName: user.name,
info: 'Age is ${user.age}',
);
}
}

```


使用：


```dart
ThirdPartyUser thirdPartyUser = ThirdPartyUser(name: 'John', age: 25);
AppUser appUser = UserAdapter.adapt(thirdPartyUser);

```


### 總結


Adapter 設計模式提供了一種方式，使得那些原本由於接口不兼容而不能一起工作的類可以一起工作。這使得我們能夠更容易地整合和重用現有的代碼，並為未來的更改提供了一定的彈性。在 Flutter 中，這種模式可以幫助我們適應和重構不同版本或第三方代碼，使其更加整合和一致。


## Flutter Design Patterns: — Composite


Composite 設計模式允許你將對象組合成樹形結構以表示"部分-整體"的層次結構。Composite 可以讓客戶端統一地對待單獨對象和對象的組合。


在 Flutter 中，這種模式已經是框架的核心部分。Widgets 就是一個很好的 Composite 模式的例子。每個小部件都可能包含其他小部件，形成一個樹形結構。


### 1. 什麼是 Composite Design Pattern？


Composite 設計模式允許你為單個對象和由它們組成的組合建立一個通用的接口。這主要用於表示部分和整體的層次。


### 2. Flutter 的具體實現：


Flutter 的整個 widget 系統就是建立在 composite 模式之上的。每一個widget都可能是一個複合的 widget，內部包含其他的 widget。例如，**`Column`**、**`Row`** 和 **`Stack`** 等都可以包含多個子 widget，形成一個組合結構。


### 3. 如何在 Flutter 中使用 Composite？


由於 Flutter 的小部件是根據 Composite 模式構建的，所以你實際上已經在使用它。但為了說明，讓我們看一個簡單的例子。


假設我們有一個 `Graphic` 接口和多個實現，例如 `Dot` 和 `CompoundGraphic`。


### 4. Dart 中的 Composite 實現：


**1. Graphic 接口：**


```dart
abstract class Graphic {
void draw();
}

```


**2. Dot 類：**


```dart
class Dot implements Graphic {
final double x, y;

Dot(this.x, this.y);

@override
void draw() {
print('Drawing a dot at: ($x,$y)');
}
}

```


**3. CompoundGraphic 類：**


```dart
class CompoundGraphic implements Graphic {
List children = [];

void add(Graphic graphic) {
children.add(graphic);
}

@override
void draw() {
for (var child in children) {
child.draw();
}
}
}

```


使用：


```dart
void main() {
Dot dot1 = Dot(1, 1);
Dot dot2 = Dot(2, 2);

CompoundGraphic graphic = CompoundGraphic();
graphic.add(dot1);
graphic.add(dot2);

graphic.draw();
}

```


上述程式將輸出：


```
Drawing a dot at: (1,1)
Drawing a dot at: (2,2)

```


### 總結


Composite 設計模式為 Flutter 開發者提供了一種強大的方式來構建和組織小部件樹。這種模式非常適合表示任何形式的部分-整體層次，並且在 Flutter 中已經得到了廣泛的應用。


## Flutter Design Patterns:  — Flyweight


當我們在開發大型的應用程式時，一個常見的問題是如何有效地管理和重複使用大量的小型資料物件，而不浪費內存資源。這裡，我將介紹一個叫做 "Flyweight" 的設計模式，這個模式有助於解決這個問題。


### 1. 什麼是 Flyweight Design Pattern？


Flyweight 設計模式主要是關於使用盡可能少的記憶體資源來儲存資料。通常是透過分享和重複使用物件來達到的。


### 2. Flutter 的具體實現：


在Flutter中，**`TextStyle`** 是一個很好的Flyweight的例子。當你在Flutter應用中定義了一個 **`TextStyle`**，這個樣式信息（例如字體、大小、顏色等）在內部會被共享和重用，而不是每次應用該樣式時都創建一個新的對象。這意味著，即使你在多個文本部件中使用了同一個 **`TextStyle`**，內存中只有一份該樣式的數據表示。


### 3. 如何在 Dart 中使用 Flyweight？


例如，假設我們有一個 `Circle` 小部件，它有不同的顏色和大小。如果我們有成千上萬的這種小部件，而且顏色只有幾種，那麼我們就可以使用 Flyweight 模式來共享顏色屬性。


### 3. Dart 中的 Flyweight 實現：


**1. Flyweight 接口：**


```dart
abstract class Circle {
void draw();
}

```


**2. ConcreteFlyweight 類別：**


```dart
class ConcreteCircle implements Circle {
final String color;

ConcreteCircle(this.color);

@override
void draw() {
print('Drawing Circle of color $color');
}
}

```


**3. FlyweightFactory 類別：**


```dart
class CircleFactory {
Map circleMap = {};

ConcreteCircle getCircle(String color) {
ConcreteCircle circle = circleMap[color];

if (circle == null) {
circle = ConcreteCircle(color);
circleMap[color] = circle;
print('Creating circle of color $color');
}

return circle;
}
}

```


使用：


```dart
void main() {
CircleFactory factory = CircleFactory();

final colors = ['Red', 'Green', 'Blue', 'Yellow'];

for (int i = 0; i

## Flutter Design Patterns: — Proxy


Proxy 就像給物件的一個小助手或者像是一個擋箭牌。它的存在就是為了幫你控制怎麼跟那個物件互動。這樣的技巧在設計模式裡，主要是讓我們能夠控制和管理對某些物件的使用。像是當你不想立刻載入資料、只有在特定時候才讓人存取，或是想知道誰用了它時，這模式就超好用。


### 1. 什麼是 Proxy Design Pattern？


Proxy 模式的主要目的是作為另一個物件的界面以控制對它的訪問。通常使用 Proxy 模式來創建一個代表大型或昂貴物件的代理，當這個物件真正需要時，Proxy 模式會負責創建它。


### 2. Flutter 的具體實現：


在 Flutter 中其實就有 `ProxyWidget`，他的實作正是 `InheritedWidget`，這裡 `ProxyWidget` 所要代表的就是 `ProxyWidget` 並不直接創建能繪製 UI 的 Widget，而是讓其他 Widget 透過他代理，把儲存在 `InheritedWidget` 裡的資料（儲存在 Element）交給要被繪製的 Widget，是一個 Proxy 很好的應用。


### 3. Dart 中的 Proxy 實現：


假設我們想要創建一個圖片代理，該代理將決定是否從網絡加載圖片或使用本地緩存。


**1. ImageProvider Proxy**


```dart
abstract class ImageProvider {
Future getImage();
}

class NetworkImageProvider implements ImageProvider {
final String url;

NetworkImageProvider(this.url);

@override
Future getImage() async {
// Load the image from the network...
}
}

class CachedImageProvider implements ImageProvider {
final ImageProvider _imageProvider;

CachedImageProvider(this._imageProvider);

@override
Future getImage() async {
// Check if image exists in cache...
// If it doesn't, use _imageProvider to load and then cache it...
}
}


```


使用：


```dart
void main() {
ImageProvider imageProvider = NetworkImageProvider('');
ImageProvider cachedProvider = CachedImageProvider(imageProvider);

// Use the cachedProvider to load the image
}


```


在上面的例子中，`CachedImageProvider` 作為一個代理，先檢查圖片是否在本地緩存中。如果不在，它會使用 `NetworkImageProvider` 加載圖片，然後將其緩存。


### 總結


Proxy 設計模式在 Flutter 中提供了一種方法，用於控制對其他物件的訪問，並在不修改其原始行為的情況下向其添加功能。這使得開發者能夠更靈活地控制資源的訪問和生命周期，並確保系統的模組化和可擴展性。


## Flutter Design Patterns: — Bridge


Bridge（橋接）模式的目的是將抽象與其實現分離，以便兩者可以獨立地進行變化。這個模式對於減少不必要的子類和提供更靈活的系統特別有用。在 Flutter 中，我們可以通過這種方式來實現多平台支持或進行其他類型的橋接。


### 1. 什麼是 Bridge Design Pattern？


Bridge 模式涉及到分離一個抽象和其具體的實現。此分離使得你可以更改抽象和實現部分，而不會相互影響。這種模式特別適用於那些即使在多個版本中也希望保持一致性的功能。


### 2. 如何在 Flutter 中使用 Bridge？


在 Flutter 中，Bridge 模式常見於與原生平台的交互中。例如，當使用 Flutter 進行開發並需要使用 Android 或 iOS 的原生功能時，我們會使用平台通道（Platform Channels）來實現橋接。


### 3. Dart 中的 Bridge 實現：


假設我們要使用手機的震動功能。由於 Flutter 自身並不直接支持這一功能，我們需要通過 Bridge 模式與原生代碼交互來實現它。


**1. 抽象部分：**


```dart
abstract class Vibrator {
void vibrate();
}


```


**2. 具體的實現部分：**


在 Flutter 中，這將涉及到使用 Platform Channels：


```dart
class NativeVibrator implements Vibrator {
static const platform = MethodChannel('com.example.vibrate');

@override
void vibrate() {
platform.invokeMethod('vibrate');
}
}


```


在 Android 的原生部分：


```java
public class MainActivity extends FlutterActivity {
private static final String CHANNEL = "com.example.vibrate";

@Override
protected void onCreate(Bundle savedInstanceState) {
super.onCreate(savedInstanceState);
new MethodChannel(getFlutterEngine().getDartExecutor().getBinaryMessenger(), CHANNEL)
.setMethodCallHandler(
(call, result) -> {
if (call.method.equals("vibrate")) {
Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
if (v != null) {
v.vibrate(500);  // Vibrate for 500 milliseconds
}
result.success(null);
} else {
result.notImplemented();
}
}
);
}
}


```


這個例子顯示了如何使用 Bridge 模式在 Flutter 和原生平台之間建立一個橋接，以實現特定的功能。


### 總結


Bridge 設計模式在 Flutter 中提供了一種組織和訪問原生平台功能的結構化方式。此模式不僅僅用於 Flutter 和原生交互，還可以用於任何你希望將抽象與具體實現分離的情境，確保它們可以獨立地變化和進行擴展。


## 大總結：


經過這一系列的分享，結構型模式的魅力想必大家都有所感受。它們不只是理論，而是幫助我們在軟體設計中實際解決問題的工具，特別是在 Flutter 這種組件化的環境中。從 Facade 到 Adapter，這些模式不僅讓我們的程式碼更有組織，也讓擴展和維護變得更簡單。希望大家在日後的開發中，能夠活用所學，讓每一個 Flutter 應用都更完善、更高效！
