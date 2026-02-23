# Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)

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
