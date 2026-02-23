# Day 28: 制訂品牌風格， Design System 讓製作畫面變得很有趣！

- 發布時間：2023-10-13 23:09:09
- 原文連結：<https://ithelp.ithome.com.tw/articles/10339205>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 28 篇

![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687mZxZx14nlR.png)

如何在 Flutter 制訂一個有品牌風格的 Design System，讓我們的產品擁有特點，辨識度就非常重要，所以從基本的顏色、字體、文字大小、圓弧曲度、陰影、間隔尺寸等等，都需要有一套標準去管理，讓開發者能夠在順暢開發之餘還能保持程式碼的可讀性。

首先需要知道 **InheritedWidget** 是什麼？這裡再次簡單說明一下(詳細可閱讀另一篇介紹 MediaQuery 的文章，將連結附在下方)，它主要負責同一棵樹的數據共享，元件必須串聯在一起，有父子關係的情況下才能存取數據，Child 元件才能取得 Parent 元件的資料以及狀態。實際上會透過 context 在就是 Element 進行操作，從 Element Tree 去訪問上方或頂部的父元件，找到指定的 parent 後我們就能存取資料。

> 相關文章，讓你對 **InheritedWidget** 有更進一步的了解  
> [Day 7: MediaQuery 是什麼？很方便但如何正確在 Flutter 使用，順便跟你說它的缺點](https://ithelp.ithome.com.tw/articles/10325095)

我們需要使用 **InheritedWidget** 幫我們實現 Design System 的建置，讓所有元件都能監聽相關配置與狀態，一旦發生變動時收到即時通知，讓 UI 馬上進行更新，確保體驗完整。而這裡不需要使用到第三方套件幫忙，直接透過 SDK API 協助我們，以後不管切換到什麼類型的專案都能夠直接運用，不受其他東西影響，也能確保每個產品的風格一致性。

------------------------------------------------------------------------

## Custom InheritedWidget

首先自定義一個 **InheritedWidget**，此範例以 AppResource 命名，代表 APP 相關資源，它是我們唯一的入口。裡面新增了一個可變狀態 AppResourceData，它乘載著所有 Design System 需要的元素，也是我們要傳導的數據。接著是 InheritedWidget 需要的 Widget Tree，也就是 child 屬性，代表會在這棵樹上做數據共享。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687OxLnlg3D84.png)  
而此類不會被繼承、實作，所以精準定義為 **final**，並且註明為 **immutable**，防止隨意擴展。

其中 `of(context)` API，是 **InheritedWidget** 的默契，只要是存取狀態、資料都會定義此方法來讓開發者使用，直覺且可讀性高，其中使用到 `dependOnInheritedWidgetOfExactType()`，目的是尋找父類的 AppResource，從中取得 AppResourceData 資料，讓我們在開發時可以使用。也因為要訪問整棵樹，所以使用到了 **context**。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687Cno4f1LAyC.png)

`updateShouldNotify()` 很簡單，就是在什麼情境下會通知 Widget Tree 狀態有變動，可能需要做一些事情，這裡會拿到舊的狀態資料，進行比對確認是否為相同實體，不是的話就進行通知。這時我們就能拿到最新的元件配置，UI 可能因此也會不一樣。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687CBgeruhBXY.png)

當元件收到通知時就會觸發 `didChangeDependencies()`，因為元件依賴的狀態有更新，可以在這做一些處理，接著按照生命週期就會觸發 `build()`，進行 UI rebuild，可以根據新的數據給使用者不同的呈現。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687CND3t7AX20.png)

### 使用

在 UI Code 我們就能透過靜態方法存取狀態，跟使用 MediaQuery 和 Theme 的操作一樣。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687lDvNzlrSYh.png)

## UI Configuration Data

到了本文重點，我們透過 AppResource 要傳導的數據就是 AppResourceData。有兩個參數，我們首先需要 **context** 取得裝置資訊，進行後續的適配，為了確保顯示一致。第二個則是設計圖的長寬 **designSize**，這部分需要跟團隊的設計師配合，確保設計圖與開發相同。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/201206870C7ZMFLB2F.png)

1.  先看大概的樣子，我們裡面會有 Design System 定義的所有配置元素，例如：顏色、文字、間隔等等，根據你們的設計而定義出相對應屬性資料
2.  當我們拿到 context 後，就可以在內部進行裝置計算。一開始，先確認現在是 light mode 還是 dark mode，決定我們要使用的顏色配套
3.  接著根據設計圖大小與現有裝置比對，取得大小倍率，需要將此數值應用在每個配置，讓它們可以完整適應螢幕的顯示
4.  最後設定 props 條件，進行實體比對，這邊使用到 **Equatable** 套件。當然也可以不需要，自行撰寫 `== operator` 以及 `hascode` 實現，或是使用 **freezed** 套件，提供更多的 API 操作

``` dart
AppResourceData(
    BuildContext context, {
    Size designSize = const Size(375, 812),
}) {
    colors = context.isLight ? _AppColorsData.light() : _AppColorsData.dark();

    _scaleFactor = context.calculateScale(designSize: context.screenSize);
}

late final _AppColorsData colors;
late final _AppTypographyData typography = _AppTypographyData(scale: _scaleFactor);
late final _AppSpacingData spacings = _AppSpacingData(scaleFactor: _scaleFactor);
...

@override
List<Object?> get props => [
    colors,
    typography,
    spacings,
    ...
];
```

### 顏色

關於產品的顏色配置，可以透過自定義的 AppColorsData 去裝載，包含 light theme 和 dark theme，設置每個屬性顏色，所以當外部在取得時，就會根據當前裝置而取得對應實體，自然 APP 的顏色配置也會改變。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687JkQ9i86jbe.png)

跟大家分享一個技巧，可以定義內部 Design 類別都是私有的，只讓 AppResourceData 存取，這樣的好處是限制存取範圍，防止直接存取此類，因為我們要的是統一規範以及存取入口。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687MIm31nYib9.png)

在 AppResourceData 的匯入方式，代表在相同 library，可以正常存取 private class

``` dart
part '_colors.dart';
part '_typographies.dart';
part '_spacings.dart';
...
```

針對有關顏色色碼的部分，可以透過 `flutter_gen` 套件生成處理，不需要手動設置與維護，前提是需要有指定的 xml 檔案，當執行 `build_runner` 命令後，就會幫我們生成對應的 Color Class，命名與註解都很完整，使用上也很便利。切記盡量不要手動操作，很浪費時間也容易出錯。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687KXtrobh07o.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687rPbFmNJ9i3.png)

### 字體文字

關於字體與文字配置，多了一個參數，為計算過後的大小倍率，讓我們設計圖上的相關數值，可以根據倍率進行縮放，否則會造成不同裝置看起來的效果有些微差異。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/201206876XvQcMlNh7.png)

首先定義設計圖上有的文字選項，這裡使用了幾種 TextStyle，支援特定字體，並給予每種類型的大小、寬高，非常好維護

``` dart
...
late final TextStyle titleSm = _createFont(_titleSmFont, size: 16, height: 20, weight: FontWeight.w600);
late final TextStyle titleXs = _createFont(_titleXsFont, size: 14, height: 12, weight: FontWeight.w600);
late final TextStyle bodyLg = _createFont(_bodyLgFont, size: 16, height: 24, weight: FontWeight.w600);
...
```

![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687fpyRec30t4.png)

裡面根據倍率去調整 fontSize、fontHeight，並更新原本提供的 TextStyle，除了完成與設計圖上一致的 TextStyle 選項，同時也做了螢幕適配。

``` dart
TextStyle _createFont(
    TextStyle style, {
    required double size,
    double? height,
    FontWeight? weight,
}) {
    final fontSize = size * scaleFactor;
    double? fontHeight = height;
    if (fontHeight != null) {
        fontHeight = fontHeight * scaleFactor;
    }

    return style.copyWith(
        fontSize: fontSize,
        height: fontHeight != null ? (fontHeight / fontSize) : style.height,
        fontWeight: weight,
        ...
    );
}
```

### 間隔空間

關於很常用到的間隔空間，不管是元件大小、padding、margin 等操作，很常需要有固定好的數值來幫助我們，一旦我們跟設計圖掛鉤，就不需要擔心數值混亂以及輸入錯誤的問題，這也是 Design System 的好處。

以下配置了幾種設計圖出現的選項，跟文字一樣，需要根據 context 算出的裝置倍率，跟實際數值進行計算，確保間隔大小一致  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687sooyMehf5C.png)

當然我們也可以在 Class 撰寫一些便利的 API，以下範例就是直接取得 Padding 元件的參數 EdgeInsets，裡面配置的數值來源都是 AppSpacingData，哪裡定義好設計規範，其他地方就是乖乖遵守。可想而知，Design System 能延伸的東西很多  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687DcV3CdamaO.png)

## Common Widget

當有了 Design System 的 UI 配置零件後，我們要開始時做自己的基礎元件，包含很常用到的文字、按鈕、間隔、圖片，因為是基建可以讓命名與品牌掛鉤，可以使用 AppText、AppButton、XYZImage、XYZScaffold、AppGap、AppPadding 等等，透過原有 SDK 元件去實作，它們就是品牌的原子，所有的一切、UI 畫面都是由這些元素組合而成，也能進一步確保顯示上的一致性。

按照品牌元件庫，很輕易就能完成一個頁面，好處是不用擔心數值問題，按照設計規範好好開發就能達到效果，懶人又高效。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687QaQJ6ymfAU.png)

以範例的 AppGap 拿出來跟大家分享，沒有狀態可以使用 StatelessWidget，根據設計圖將各個間隔尺寸使用 AppSize 去管理，當開發在使用元件時，就可以透過自定義的命名建構去存取，以此範例就是使用指定間隔的 Gap 元件  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687KDSTNSdCQf.png)

AppSize 為 enum，根據設計圖上的尺寸規範定義種類，這裡也可以使用 xs、sm、md、lg、xl 去命名，主要根據團隊默契去選擇。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687z5SCn1sqNh.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687IArEF9VXEl.png)

當得知 AppSize 後就可以轉換成對應的 Gap 元件，其中數值透過額外撰寫的 extension api，取得我們先前定義的 spacing 設計圖配置，將這一切轉換流程都先在元件裡面撰寫完成，之後只需要呼叫使用就好了。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687FYA7W2JXCs.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687NspZRgPdv7.png)

而每一個元件都會使用到 AppResourceData，存取設計圖配置，統一從 **context** 與 `AppResource.of()` 入口操作。

> Gap 來自 **gap** 套件，好處是只需要給定數值，能自動適配 Column 和 Row。背後是自定義 的RenderObject，檢查父類方向在進行設置。讓開發者輕鬆使用，非常方便  
> <https://pub.dev/packages/gap>  
> ![](https://ithelp.ithome.com.tw/upload/images/20231013/201206877jIYEJ3ILr.png)

#### AppText

Text元件也一樣，我們根據設計規範去定義產品會使用到的幾種 Text 元件，所有的命名都跟 Guideline 相同，假如設計圖有 6 種字型大小，那整個 APP 就只會有這 6 種，使用上方便快速，避免開發者隨意定義文字元件導致難以維護的情況。當然範例中的參數，可以根據 UI 需求去設置，最基本的 Text 元件需要暴露哪些參數都由設計與開發決定。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687msL1LIrf3e.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687XQrzw8bNoI.png)

透過準備好的基礎元件庫，實作了一個產品需要的覆用元件，根據原子設計的概念，此元件就是一個 Organisms，由多個 Atom 和 Molecule 組合而成，讓它再多個頁面重複使用，提升開發效率。其中可以看到其中的很多地方都是基礎元件以及 AppResourceData 定義好的參數配置，完全不會有任何的 hard-coding 以及隨意撰寫樣子，一目了然也讓人放心。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687l8QqxlKbGk.png)

下方範例是沒有設計系統的撰寫方式，在沒有規範的情況下，會將代碼寫的很長，而這些在每個元件都重複了很多次，本身沒有意義也浪費時間，當其中某一個數值改變後，所有相關的元件都要手動修正。再來是沒有做到裝置適配，呈現給用戶的結果也會有差異。一經比較後，大家應該感受到差異性了  
![](https://ithelp.ithome.com.tw/upload/images/20231013/2012068738T9WW3EGC.png)

------------------------------------------------------------------------

## 總結

在實作 **Design System** 的幾個重點，在跟大家說明一次：

1.  首先創建基礎元件庫，也就是根本的原子，從原子在堆疊成分子元件，撰寫出支援產品風格的各種元件
2.  確保基礎元件與開發的所有元件，都要遵守規範，與設計圖定義的種類、尺寸完全一致。另外，裝置的適配也需要重視
3.  使用可提供幫助的元件 Package，例如本文提到的 **gap**，但一切根據需求決定使用，不要隨意盲從
4.  持續參考 SDK 元件的實作方式，或是第三方元件庫，適時優化 Design System，提升實作品質
5.  為了元件的 Accessibility，可以為元件加上 Semantics，也就是幫元件或 Widget Tree 描述本身的意義，讓輔助工具可以更快速的知道元件用途
6.  擁有屬於 Design System 相關檔案的目錄，成熟的話可以將它獨立出來，實作成一個 Package，提供給各個產品做使用

從上一篇的 **Atomic Design** 解說到本文的 **Design System** 實作，目的是要讓大家了解觀念和它們的重要性，當我們擁有自己的設計系統後，在開發 UI 上就變得輕鬆且容易，反而還會變得喜歡製作畫面，因為非常快速，體驗過後去回不去了。而當有了元件庫，公司的每個產品就能共用它們，有效避免重寫，一套支援多應用，管理上也非常方便，甚至大型團隊還會有負責 UI 相關的成員。

這時，再運用 Widgetbook 等輔助工具，讓非開發相關人員能即時瀏覽元件庫，體驗實際效果，多端的溝通可以保持頻率一致，善用工具真的有很多好處，幫助我們的產品更加完整。

希望本文有讓你學到東西，重視 Design System 確實讓開發生活更美好了，大家同意嗎？！

## 延伸閱讀

- [Day 27: 什麼是 Atomic Design 與 Design System？從 Flutter 快速掌握它們！](https://ithelp.ithome.com.tw/articles/10338681)
