# Day 37：Clean Architecture X Flutter (一)  | SOLID 🛁

> 原文來源：[Day 7：Clean Architecture X Flutter (一)  | SOLID 🛁](https://ithelp.ithome.com.tw/articles/10325321)

講完了 CI/CD，接下來就帶大家一起探討一下架構吧！這部分的會從 Clean Acritecture 入門開始解說，今天先帶帶家看 Clean Architecture 這本書，我覺得很重要的兩個章節 SOLID 和 Clean Architecture。熟悉了這些以後，以後面會對程式應該如何起手、怎麼寫才整潔，會有更多的想法和依循的標準。在大家有點概念以後，明天再開始實戰演練！


```jsx
🛁 看完這章節你將學到
> Clean Architecture SOLID 的基本觀念和範例
> 架構的大原則

```


很多時候我們都認為會寫程式就好，對這種只談架構跟方法論的書不一定提得起興致，但是如果你真的有深入閱讀這些知識，可以提升你的品味，讓你不管是在讀或是寫都能夠更上一層樓。透過這些明訂的標準，也可以很快地和其他人討論那些你認為不對勁，但卻又說不出哪裡有問題的程式碼，好處多多！


# SOLID


SOLID 是一個簡寫，每個字母代表了一個軟體設計原則。這些原則旨在幫助開發人員編寫更好的、易於維護和擴展的程式碼。


## Single Responsibility Principle (SRP)：單一職責原則


單一職責原則指出，每個類別都應該只有一個職責。這樣可以使程式碼更加清晰、易於維護和擴展。如果一個類別有多個職責，那麼當其中一個職責需要更改時，可能會對其他職責造成影響，並且會使程式碼變得複雜。


解決方案：Facade


Facade 是一種軟體設計模式，旨在簡化複雜的介面。它提供了一個簡單的介面，以便用戶端可以更輕鬆地訪問複雜的系統。


Facade 模式通常將一個複雜的系統分解成多個獨立的模塊，每個模塊都有自己的功能和職責。然後，Facade 類別將這些模塊組合在一起，提供一個簡單的介面，使用戶端可以更輕鬆地訪問系統。


Facade 模式的主要優點是可以隱藏系統的複雜性，並提供一個簡單的介面，使用戶端更容易使用系統。此外，它還可以提高程式碼的可重用性和可測試性，有助於開發出更高質量的軟體。


```
class Facade {
private Subsystem1 subsystem1;
private Subsystem2 subsystem2;
private Subsystem3 subsystem3;

Facade() {
subsystem1 = new Subsystem1();
subsystem2 = new Subsystem2();
subsystem3 = new Subsystem3();
}

void operation() {
subsystem1.operation1();
subsystem2.operation2();
subsystem3.operation3();
}
}


```


上面的程式碼演示了 Facade 模式的基本結構。Facade 類別將多個子系統組合在一起，提供了一個簡單的介面 operation()，使用戶端可以更輕鬆地訪問系統。


```
class Subsystem1 {
public void operation1() {
System.out.println("Subsystem1 operation1");
}
}

class Subsystem2 {
public void operation2() {
System.out.println("Subsystem2 operation2");
}
}

class Subsystem3 {
public void operation3() {
System.out.println("Subsystem3 operation3");
}
}


```


上面的程式碼演示了子系統的基本結構。每個子系統都有自己的功能和職責，並且可以與其他子系統協同工作，實現複雜的系統行為。


總的來說，Facade 模式提供了一種簡單而強大的方法，可以簡化複雜的系統，提高程式碼的可重用性和可測試性，並實現更高質量的軟體。


## Open/Closed Principle (OCP)：開放封閉原則


開放封閉原則指出，軟體實體（例如類別、模塊、函式等）應該對擴展開放，對修改封閉。這意味著**當需要添加新的功能時，應該擴展現有的程式碼，而不是修改現有的程式碼**。這樣可以使程式碼更加穩定和易於維護。


以下是一個開放封閉原則的範例：


```
abstract class Shape {
void draw();
}

class Rectangle extends Shape {
@override
void draw() {
print('Drawing a rectangle');
}
}

class Circle extends Shape {
@override
void draw() {
print('Drawing a circle');
}
}

class Drawing {
final List _shapes = [];

void addShape(Shape shape) {
_shapes.add(shape);
}

void drawAll() {
for (var shape in _shapes) {
shape.draw();
}
}
}

void main() {
final drawing = Drawing();
drawing.addShape(Rectangle());
drawing.addShape(Circle());
drawing.drawAll();
}


```


上面的程式碼演示了一個簡單的圖形繪製程式。Shape 是一個抽象基類，Rectangle 和 Circle 是 Shape 的派生類別。Drawing 類別負責管理所有的 Shape 物件，並將它們全部繪製出來。


現在，如果我們需要添加一個 Triangle 類別，我們可以透過繼承 Shape 來進行擴展，而不需要修改原有的程式碼：


```
class Triangle extends Shape {
@override
void draw() {
print('Drawing a triangle');
}
}

```


這樣，我們就成功地擴展了程式的功能，而不需要修改原有的程式碼。這就是開放封閉原則的魅力所在。


## Liskov Substitution Principle (LSP)：里氏替換原則


里氏替換原則指出，**子類別應該能夠替換其父類別在任何地方出現的位置，而不會對程式的正確性產生影響**。這樣可以使程式碼更加靈活和可重用，並且可以降低代碼出錯的風險。


以下是一個 LSP 原則的範例：


```
class Rectangle {
protected int width;
protected int height;

public void setWidth(int width) {
this.width = width;
}

public void setHeight(int height) {
this.height = height;
}

public int getWidth() {
return width;
}

public int getHeight() {
return height;
}

public int getArea() {
return width * height;
}
}

class Square extends Rectangle {
@Override
public void setWidth(int width) {
super.setWidth(width);
super.setHeight(width);
}

@Override
public void setHeight(int height) {
super.setHeight(height);
super.setWidth(height);
}
}

class LspDemo {
static void useIt(Rectangle r) {
int width = r.getWidth();
r.setHeight(10);
System.out.println("Expected area of " + (width * 10) + ", got " + r.getArea());
}

public static void main(String[] args) {
Rectangle rc = new Rectangle();
rc.setWidth(2);
rc.setHeight(3);
useIt(rc);

Rectangle sq = new Square();
sq.setWidth(5);
useIt(sq);
}
}


```


上面的程式碼演示了 LSP 原則的運作方式。Rectangle 是一個基礎類別，Square 是 Rectangle 的一個派生類別。Square 類別繼承了 Rectangle 類別的所有屬性和方法，並且重寫了其中的 setWidth 和 setHeight 方法，以確保 width 和 height 始終相等。


在 LspDemo 類別中，我們先創建了一個 Rectangle 對象 rc，並將其寬度設置為 2，高度設置為 3。然後，我們調用了 useIt 函式，將 rc 對象作為參數傳遞過去。useIt 函式將高度設置為 10，並計算出預期的面積。最後，它打印出了預期的面積和實際的面積。


接下來，我們創建了一個 Square 對象 sq，並將其寬度設置為 5。然後，我們再次調用了 useIt 函式，並將 sq 對象作為參數傳遞過去。由於 Square 類別繼承了 Rectangle 類別的所有屬性和方法，因此可以維護 LSP 原則的完整性，它要求子類別必須能夠代替其父類別，而不會對程式的正確性產生影響。如果不遵循 LSP 原則，可能會導致程式出現不可預測的錯誤，並且會使程式碼變得更加複雜和難以維護。


## Interface Segregation Principle (ISP)：介面隔離原則


介面隔離原則指出，**用戶端不應該依賴於它不需要的介面**。這樣可以使程式碼更加簡潔和易於維護。如果一個介面太大，那麼一些用戶端可能需要實現它們不需要的方法，這將導致程式碼的浪費和不必要的複雜性。


以下是一個 ISP 原則的範例：


```
abstaract Machine {
void print();

void scan();

void fax();
}

class MultiFunctionPrinter implements Machine {
@Override
void print() {
// print implementation
}

@Override
void scan() {
// scan implementation
}

@Override
void fax() {
// fax implementation
}
}

class OldFashionedPrinter implements Machine {
@Override
void print() {
// print implementation
}

@Override
void scan() {
// Do nothing, an OldFashionedPrinter can't scan
}

@Override
void fax() {
// Do nothing, an OldFashionedPrinter can't fax
}
}


```


上面的程式碼演示了 ISP 原則的運作方式。Machine 是一個介面，它定義了三個方法：print、scan 和 fax。MultiFunctionPrinter 類別實現了 Machine 介面，它可以執行 print、scan 和 fax 三個方法。OldFashionedPrinter 也實現了 Machine 介面，但是它只能執行 print 方法，因為它不能掃描和傳真。


這裡的問題是，OldFashionedPrinter 類別實現了它不需要的方法（scan 和 fax）。這會導致程式碼的浪費和不必要的複雜性。為了解決這個問題，我們可以透過介面隔離原則來重新設計程式：


```
abstract class Printer {
void print();
}

abstract class Scanner {
void scan();
}

abstract class Fax {
void fax();
}

class MultiFunctionMachine implements Printer, Scanner, Fax {
@override
void print() {
// print implementation
}

@override
void scan() {
// scan implementation
}

@override
void fax() {
// fax implementation
}
}

class OldFashionedPrinter implements Printer {
@override
void print() {
// print implementation
}
}

```


上面的程式碼演示了重新設計過的程式。我們現在將 Machine 介面分解為三個獨立的介面：Printer、Scanner 和 Fax。然後，我們創建了一個 MultiFunctionMachine 類別，它實現了這三個介面。OldFashionedPrinter 類別實現了 Printer 介面，但是它不需要實現 scan 和 fax 方法。


這樣，我們就成功地實現了介面隔離原則，用戶端不再依賴於它不需要


## Dependency Inversion Principle (DIP)：依賴反轉原則


依賴反轉原則指出，高層模塊不應該依賴於低層模塊，兩者都應該依賴於抽象。這樣可以使程式碼更加靈活和易於維護。如果高層模塊直接依賴於低層模塊，那麼當低層模塊需要更改時，高層模塊也需要更改，這將導致程式碼的脆弱性和難以維護性。


以下是一個依賴反轉原則的範例：


```
abstract class Database {
void connect();
}

class MySqlConnection implements Database {
@override
void connect() {
// implementation for MySQL connection
}
}

class OracleConnection implements Database {
@override
void connect() {
// implementation for Oracle connection
}
}

class DataService {
final Database database;

DataService(this.database);

void fetchData() {
database.connect();
// code to fetch data
}
}

```


上面的程式碼演示了依賴反轉原則的運作方式。Database 是一個抽象類別，它定義了 connect 方法。MySqlConnection 和 OracleConnection 是 Database 的兩個實現類別。DataService 類別依賴於 Database 類別，它的建構子接收一個 Database 類別的實例。fetchData 方法使用 database 來連接數據庫並獲取數據。


這樣，我們就成功地實現了依賴反轉原則，高層模塊 DataService 不直接依賴於低層模塊 MySqlConnection 和 OracleConnection，而是依賴於抽象的 Database 類別。這樣可以使程式碼更加靈活和易於擴展，當需要切換數據庫時，DataService 類別不需要修改程式碼，只需要使用不同的 Database 實現類別即可。這樣可以降低代碼出錯的風險，並實現更高質量的軟體。


# 架構


**一名好的架構師，可以將不做出決定的數量給最大化**


# Clean Architecture


Clean Architecture 中的每一層都有其獨立的職責和功能。這些層次從最內部到最外部分別是：


- 實體層(Entity Layer)

- 用例層(User Case Layer)

- 介面層(Interface Layer)


![](https://ithelp.ithome.com.tw/upload/images/20230922/201173636UN3TtcTAM.png)


### 實體層(Entity Layer)


實體層是 Clean Architecture 中最內部的一層，它包含了應用程序中的實體類別和業務邏輯。實體層是整個應用程序的核心，它定義了應用程序中的核心業務邏輯。


實體層的職責是：


- 定義實體類別和業務邏輯。

- 負責將實體類別映射到數據庫中的表格。


實體層應該是完全獨立的，不依賴於其他層次。這樣可以使實體層更加易於測試和重用。


### 用例層(Use Case Layer)


用例層是 Clean Architecture 中的第二層，它包含了應用程序的用例和業務邏輯。用例層的職責是：


- 定義用例和業務邏輯。

- 負責處理用戶輸入和輸出。


用例層處理所有的用戶交互，包括用戶輸入和輸出。用例層也負責調用實體層提供的服務和方法。


用例層應該是完全獨立的，不依賴於其他層次。這樣可以使用例層更加易於測試和重用。


### 介面層(Interface Layer)


介面層是 Clean Architecture 中最外部的一層，它包含了應用程序的介面和 UI 邏輯。介面層的職責是：


- 定義應用程序的介面和 UI 邏輯。

- 負責呈現用戶界面。


介面層處理所有的用戶界面，包括用戶界面和 UI 邏輯。介面層也負責調用用例層提供的服務和方法。


## 結論


說到寫程式，我們都希望能寫出既好用又不容易出錯的程式，對吧？Clean Architecture就是幫我們達到這個目的的好方法之一。它讓我們的程式碼變得更清晰、好測試、而且模塊間互相牽扯得少。那SOLID原則呢？就是告訴我們如何做到這一點的五個建議或技巧。


透過這篇文章，我們看到了，好的架構和設計其實不只是要讓程式運行，更重要的是要讓它能夠隨著時間過去，還能夠輕鬆修改、增加功能，而不會一團亂。從SOLID到Clean Architecture，都是告訴我們如何寫出這樣好的程式的黄金法則！
