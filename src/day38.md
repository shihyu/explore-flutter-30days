# Day 38：Clean Architecture X Flutter（二）| Flutter 實踐篇 🛁

> 原文來源：[Day 8：Clean Architecture X Flutter（二）| Flutter 實踐篇 🛁](https://ithelp.ithome.com.tw/articles/10325942)

## 引言:


嗨嗨大家！👋 讓我們今天一起再跳入 Flutter 的魔法世界，不過這次我們的主題會稍微進階一些——「Clean Architecture」。記得昨天我們聊到了 SOLID 原則嗎？那只是個開始。如果你正在想怎麼讓你的 Flutter 項目更加組織有序、更加容易維護，這篇文章是給你的。


在昨天的介紹裡，我們深入探討了 SOLID 原則，了解了它如何成為軟體設計的核心基石。今天，我們要進一步看看如何在 Flutter 中實踐 Clean Architecture。首先，我們要明確 Clean Architecture 的目的：它希望能建立一個**獨立於框架、可測試、獨立於 UI 的架構**。這樣一來，應用程式的業務邏輯和外部界面就能夠獨立發展、維護。


一樣先開始介紹先擺上最常見的這張圈圈圖，理解 Flutter 的功能與 Clean Architecture 之間的對應關係。


![](https://ithelp.ithome.com.tw/upload/images/20230923/20117363akWpiUEhMM.png)


- Entities → Models

代表了業務領域中的核心概念。例如，在一個電商平台中，"商品"、"用戶" 和 "訂單" 可能都是實體或模型。它們主要包含數據以及和這些數據相關的業務邏輯。


- Use Cases → Services


**Use Cases** 描述了特定的業務流程或功能，代表了系統需要執行的操作或活動。當這些 **Use Cases** 被具體實現時，在程式碼通常被命名為一個 **Services**。**Services** 是封裝特定業務邏輯的組件或模組，可以被多個 **Controller** 或其他組件重用。例如，在電商平台中，UserService 可能就會包含，更新密碼、上傳頭貼、更新用戶設定等等的 use case。


- UI → Widgets


**UI** (User Interface) 是用戶與系統互動的介面，由多個 **Widgets** 組成。


- DB → Repository


**Repository** 代表了從數據庫獲取和存儲數據的方法，這讓我們取用數據時，不直接依賴某個數據庫，而是依賴於 **Repository** 的實作。


- Controllers → Controllers


**Controller** 是介於接收來自用戶的輸入，然後調用相應的業務邏輯或服務來處理輸入，最後更新視圖或UI以反映任何變化。在電商服務中，在你要更新密碼時，點擊更新按鈕，點擊下去以後就會讓 **Controller** 去負責，**Controller** 可能會先檢查你輸入的格式對不對，如果錯誤會顯示讓 UI 顯示相應的結果，然後去 Call Servie 幫你完成更新密碼，再根據結果通知 App 畫面顯示成功或失敗。


下面我們拿購物車來做一個完整舉例：


💡 完成購物車必須具備以下的任務，選擇商品與數量 → 點擊確認 → 完成更新購物車


首先最重要的實體就是 購物車，因此我們會定義一個 model `cart.dart`，代表最核心的實體。


```dart
class Cart {
Map  cartStorage;
}

```


接下來考慮 use case，也就是我們的購物車會有哪些要完成的功能，寫成 `cart_service_interface.dart`，裡面包含 CartService 需要的功能，這裡的例子就是更新購物車。


寫成 abstract 的好處也有助於我們在開始完善程式碼前，先想清楚這個 Service 會有哪些功能需要被完善。甚至你在完善 Repository 之前，也可以先寫上然後後續再補上 Repostory 。


```dart
abstract class CartService {
void updateCart(Item, amount);
List getItems();
}

class CartService {
CartService(cartRepository);

List getItems(){
return cartRepository.getItems();
}

void updateCart(item, amount) {
cartRepository.updateCart(item, amount);
}
}

```


在實作中加入 repository 操作 db(local) 或 api(remote)


```dart
abstract class CartRepository {
void saveChart(List items);
List getItems();
}

class LocalCartRepository implements CartRepository {
@override
void saveCart(List items) {
// 在這裡實現 DB 存儲的邏輯
}

@override
void getItems(List items) {
// 在這裡實現從 DB 取得購物車資料
}
}

```


最後在我們來完善 Controller，想像一下用戶實際操作 UI 會是什麼樣的場景，可能他會有一個加入購物車的按鈕，所以我們加上 addCart 的方法，檢查一下操作是否正常，最後更新資料庫。這裡假設如果他要加入購物車的數量，已經大於商品本身的剩餘數量，會拋出錯誤。


```dart
class CartController {
Future addCart(Item item,int amount) async {
if(amount > item.avalible){
throw ItemNotEnoughException();
}
await cartService.updateCart(item, amount);
}
}

```


UI 會根據 Controller 收到的訊息來顯示


```dart
TextButton(
onPressed: () async {
try {
await cartcontroller.addCart(item, amount);
showToast("商品已加入");
} on ItemNotEnoughException {
showToast("選擇數量大於剩餘數量");
}catch (e) {
showToast("加入購物車失敗");
}
},
child: const Text(
"加入購物車",
),
);

```


至此我們完成了一個完整的功能模組，當然在每個專案不同搭配上不同的管理工具，在使用上可能會有些許變化，但都可以遵循上面的原則去完成。


上面實踐的方法，有借鑑和參考這篇文章，強烈建議大家有空也可以去拜讀，會收穫滿滿。
[https://codewithandrea.com/articles/flutter-app-architecture-riverpod-introduction/](https://codewithandrea.com/articles/flutter-app-architecture-riverpod-introduction/)


### 資料夾結構


講完程式碼，比程式碼本身更抽象的就是資料夾結構，這裡當作額外 Bonus 介紹幾種資料夾結構跟大家分享。


### 1. 以 Layered Architecture 為基礎：


**優點**：


- **清晰性**：每一層的責任都非常明確，這有助於開發者快速了解代碼的組織結構。

- **可重用性**：由於層與層之間的清晰分隔，它提供了更好的重用性，特別是在 domain 和 data 層。

- **解耦**：這種組織方式將業務邏輯、資料和 UI 層之間進行了清晰的分隔。


**缺點**：


- **橫向擴展**：隨著功能增加，每層都會變得越來越龐大，這可能會使特定功能的相關代碼分散在不同的目錄中。


```
lib/
│
├── ui/
│   ├── pages/
│   │   ├── home_page.dart
│   │   └── ...
│   └── widgets/
│
├── application/
│   ├── service/
│   └── repository_interfaces/
│
├── data/
│   ├── models/
│   ├── datasources/
│   └── repositories/
│
├── infrastructure/
│   ├── network/
│   ├── local_db/
│   └── ...
│
└── main.dart


```


### 2. 以 Feature-Based 結構為基礎：


**優點**：


- **模組化**：每個功能都是獨立的模組，這使得代碼更具可維護性和可擴展性。

- **團隊協作**：不同的開發者或小組可以專注於不同的功能，互相之間的干擾會降低。

- **便於查找**：查找與某個特定功能相關的所有代碼變得非常容易。


**缺點**：


- **重複性**：可能會有一些重複的代碼或結構，尤其是當多個功能有類似的需求時。


```
lib/
│
├── features/
│   ├── feature1/
│   │   ├── data/
│   │   ├── application/
│   │   │   ├── service/
│   │   ├── domain/
│   │   └── presentation/
│   ├── feature2/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── ...
│
├── core/
│   ├── errors/
│   ├── service/
│   ├── entities/
│   └── ...
│
└── main.dart


```


目前我們的團隊是採用第二種 Feature-Based 結構為基礎，確實一定程度上可以讓分工更容易，但這完全取決於你們不同的工作模式，歡迎大家參考分享。


## 結語:


寫到這裡，希望透過這篇文章，你能夠有一個更深入的認識和了解 Clean Architecture 在 Flutter 的應用。正如我們所見，將清晰的架構帶入到 Flutter 中，不僅使得代碼更加模組化、可維護，還能夠確保業務邏輯和 UI 之間的獨立性。但這只是冰山一角，實際在項目中可能會遇到更多複雜的場景和挑戰。無論如何，只要堅持學習和實踐，我們總會找到最適合的方案！期待下次再和大家分享更多的知識和經驗！🚀👩‍💻👨‍💻🎉
