# Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)

- 發布時間：2023-10-06 16:03:56
- 原文連結：<https://ithelp.ithome.com.tw/articles/10335311>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 21 篇

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687IhJZ0LeTy3.png)

大家對於 DevTools 還熟悉嗎？專屬於 Flutter 的 Debugging 工具，本身也是使用 Flutter 進行開發，以這工具來看，就可以知道 Flutter 淺力了對吧，順暢表現當然沒問題。不過這是題外話，就我的觀察與了解，大部分開發者不太熟悉它，很多人比較常用 Inspector，查看排版佈局以及定位元件，其他很多功能都沒在使用，但它們卻非常重要也很有價值。

本文就是要帶大家了解 DevTools，逐步說明 Flutter Inspector 以及 Performance 工具，如何幫助我們開發以及優化產品，附上非常多的實際操作流程以及範例，希望讓大家更有感覺，並開始擁抱和喜歡使用它們。

## 何謂 APP 的順暢表現？

APP 的每一幀創建和渲染在各別的線程上運行，分別是 UI Thread 和 Raster Thread，如果要避免延遲，需在16毫秒或更短的時間內創建、處理並顯示一幀，才能期望一秒達成 60 幀。如果發現 APP 總渲染時間低於16毫秒，即使存在一些效能缺陷，也不必擔心，因為可能不會產生視覺差異，比較難感受出來。隨著近幾年 120fps 設備的普及，就需要8毫秒內完成渲染流程，以提供最流暢的體驗，而在順暢的運行下也可以有效改善電池壽命和散熱問題。

在 Flutter 裡，官方提供了 DevTools 工具協助我們開發，那什麼情境下需要使用工具來優化 APP 呢？

- 畫面幀數偏低
- 操作卡頓
- 圖片載入緩慢
- 記憶體使用過多
- 網路請求等待時間長
- APP 體積過大，不理想
- 電量消耗速度快
- 啟動時間過長

其中幾點情況你的 APP 有遇到嗎？有的話是不是要考慮優化專案了？我們趕緊往下邊閱讀邊操作吧！

------------------------------------------------------------------------

## 專案的運行模式

在學會使用工具之前，需要先了解 Flutter 幾種專案的運行模式，每個模式適合的情境都不同

### Dev

- 使用 Dart JIT Compiler
- `適合開發階段`
- 支援設備和模擬器
- 可以使用 Hot reload
- 可以插入 Breakpoints
- 適合使用 DevTools 處理佈局排版、尋找元件
- 沒有壓縮資源檔案，也沒有做性能優化，導致 APP 體積大，而運行上會比實際還要卡頓，如果要做效能調校是建議在 Profile mode

``` dart
flutter run --debug

# flavor
flutter run --debug --flavor dev --target ./lib/main_dev.dart
```

### Profile

- 使用 Dart AOT Compiler
- `適合分析性能、效能調教`
- 只支援設備
- 適合使用 DevTools 進行性能表現的檢測，適合查看 Performance、CPU、Memory
- 沒有壓縮資源檔案，但整體性能有優化，可以實現接近 Release mode 的性能

``` dart
flutter run --profile
```

### Release

- 使用 Dart AOT Compiler
- `適合正式產品`
- 只支援設備
- 使用 `tree-shaking` 壓縮資源檔案，實現運行時的效能最優化。因此，APP容量最小，可以快速啟動、處理運算

``` dart
flutter run --release
```

## 影響性能的兩個關鍵因素

### Time

- UI 和 Raster 花的時間過長，渲染畫面需要每一幀 16ms 內完成才能保證順暢，確保一秒60幀
- 當有某一幀超過 16ms，代表會佔用或跳過下一幀的圖像，導致卡頓的情況發生

### Space

- 記憶體佔用過多、創建太多無意義實體、保存了不需要的記憶體
- 內存泄露。通常是沒有正常的管理資源，在對的時間點關閉服務、釋放資源

## DevTools

- 官方用 Flutter 開發的可視化檢測工具，目前使用全新的 **Material 3** 設計風格，以圓弧為重點，視覺上舒服
- 包含許多功能，包含程式碼檢測、佈局瀏覽、CPU檢查、渲染性能檢查、記憶體檢查、網路檢查、體積分析
- 可以輕鬆了解用戶體驗，例如：卡頓狀況、頁面載入速度或響應時間  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687E9YHAwN9DX.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687VzgVYA5dHB.png)

### 使用 DevTools 分析性能

#### 檢測

1.  找出影響最大的原因，清楚了解哪些 UI、操作表現良好，哪些部分表現不佳
2.  專注於性能較差的地方，從中量化影響，比較改動之前後，確認優化結果，在有限時間內取得最大的改善

#### 優先處理

1.  使用者花費最多時間
2.  對使用者來說影響最大的

------------------------------------------------------------------------

## Flutter Inspector

- 負責檢查 UI 排版、診斷佈局問題
- 完整瀏覽 APP WidgetTree，目前畫面上的排版架構與層級，一目了然
- 當 UI 有問題時錯誤會直接提醒，點擊元件即可查看詳細資訊  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687Yr0a81ktjG.png)

### Layout Explorer

- 佈局管理器
- 查看元件與元件之前的排版資訊，包含設置的屬性，例如：長寬大小、主軸配置、次軸配置、最小與最大約束
- 可直接調整元件的屬性配置，調整後裝置也會即時更新UI，不用從程式碼上修改，能更快地確定排版跟效果，節省很多時間  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687d79fa0UDF3.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687gh2W63Cjof.png)

以下範例，我針對 Column 做了調整，動了 DecoratedBox 和 AppGap 兩個元件的配置，當我調整後，右邊的 UI 也即時更新，可以再確認效果後再去改程式碼就好。  
![Layout Explorer](https://i.imgur.com/xqgrd2a.gif)

### Widget Details Tree

- 瀏覽架構、元件資訊，包含所有的屬性狀態

![Widget Details Tree](https://i.imgur.com/YYH3ZDF.gif)

### Select Widget Mode

- 元件選擇模式
- 支援點擊畫面上的元件，IDE 會直接跳轉到對應的元件程式碼，而當我們有打開 Flutter Inspector，Widget Tree、Layout Explorer、Details Tree 都會進行跳轉。但是如果 Widget Tree 剛好很多層元件很深的話，就會變的比較難找到，可能會需要嘗試點擊好幾次

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687bRmYEOFbre.png)  
![Select Widget Mode](https://i.imgur.com/JFzx652.gif)

### Show guidelines

- 顯示渲染框，方便了解元件的對齊風格、填充大小、剪裁

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687U9fXNH5F5n.png)

### Show baselines

- 單純檢查文字的對齊狀況

![](https://ithelp.ithome.com.tw/upload/images/20231006/201206876yqOEqFK77.png)

### Highlight Repaints

顯示渲染框，根據元件的重繪次數顯示不一樣的顏色，註記那些會頻繁重繪的範圍。在每次重繪時有刷新的元件線條顏色會一直變換，如果此時有看到不應該重繪的元件頻繁更新顏色，就代表程式碼需要優化，嚴重的話會影響 APP 效能表現。

以下方範例來看，點擊的選項顏色與外框都會比較突出，所以選擇後會根據狀態更新新舊兩個元件，這時候會看到有兩個元件的外框顏色在變化，其他不相關的部分會保持原本顏色，也代表沒有無意義更新。

![Highlight Repaints](https://i.imgur.com/hiywSFR.gif)

如果不想開啟 DevTools 也可以在主函式 `main()` 設置 **debugRepaintRainbowEnabled** 為 true，需要匯入 `rendering.dart`。

``` dart
debugRepaintRainbowEnabled = false;
```

### Highlight Oversized Images

標示大型圖像，通過顏色反轉和顛倒來標示體積過大、使用大量記憶體的圖像。不管是本地圖像還是雲端圖像都可以檢測。如果有使用到很長的 ScrollView，當大量大體積圖像載入時，可能會有效能表現的影響。

多大的體積，會被標記為大型圖像呢？超出 **debugImageOverheadAllowance** 設置大小，預設為**128kb**  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687UQ5fJhLRyG.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687jfb9AUbaaE.png)

當發現大型圖像時 Console 也會看到 Painting Exception。以下範例顯示，元件實際的寬長為 852×563 但是卻解析了 1179×786 尺寸的圖像，同時也給予了建議，可以設置 **cacheWidth**、**cacheHeight**，或是使用 **ResizeImage** 優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/201206876hyyEKmh4T.png)

如果不想開啟 DevTools 也可以在主函式 `main()` 設置 **debugInvertOversizedImages** 為 true。

``` dart
debugInvertOversizedImages = true
```

當然也可以設置圖片的允許大小，透過 **debugImageOverheadAllowance** 進行調整。下方範例調整為 256kb，不過實際上要評估普遍用戶的裝置類型與記憶體使用來設置，太大反而是個風險。

``` dart
debugImageOverheadAllowance = 256 * 1024;
```

## Performance

- 可視化時間和性能指標，資訊包含每一幀在 UI Thread 和 Raster Thread 處理時間。如果此幀 UI 有卡頓情況，代表超過16毫秒，會以 Jank (slow frame) 顯示，這時候會是粉紅顏色來呈現
- 以柱狀圖表呈現，x 軸為第幾幀，y 軸為消耗毫秒數。中間灰色線代表 8ms，也就是在它以下即可擁有 120 幀的表現
- 整體操作體驗良好，易讀性高

![Performance](https://i.imgur.com/hySlHLJ.gif)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687LDsH0mEHCT.png)

右邊有告知每個顏色所代表的資訊：

1.  淺藍色 → UI Thread(CPU Thread)，代表 Dart VM 上的所有運行程式碼，處理 Layout、Paint，接著將 Layer Tree 交給 Raster Thread。必須確保過程同步運行，不能阻塞
2.  深藍色 → Raster Thread(GPU Thread)，負責處理渲染，背後有 Skia 和 Impeller 圖形引擎的計算，最終透過 GPU 將像素顯示出來
3.  橘紅色 → Jank 卡頓幀，代表一幀可能接近或超過 16ms，有性能疑慮
4.  深紅色 → 著色器編譯問題，在目前 Impeller 引擎上不會有影響，比較有關係的是還在使用 Skia 的 Android 設備，需要注意
5.  顯示一秒的平均幀數。以範例使用的設備，支援 ProMotion 120 fps，性能上有一點差異

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687w0f2dsT4My.png)

### Frame Analysis

幀分析。查看當前幀的 UI 與 Raster 處理時間，以下方範例來看，就是 Raster 部分特別耗時。以經驗來看可能跟顯示圖片、圖像有關  
![](https://ithelp.ithome.com.tw/upload/images/20231006/201206870uXLdpnPtp.png)

### Raster Stats

渲染光柵狀態。針對當下取得快照，了解當前幀的詳細資訊，包含被處理的每個元素、渲染時間、每個元素佔的總體比例。

實際在 Flutter Rendering Pipeline 裡 RenderObject Tree 會轉為 Layer Tree，接著交給 Compositor 將每個 Layer 組合起來並匯出圖層，詳細可以留到其他文章來討論。所以畫面上才會顯示第幾 Layer。  
![Raster Stats](https://i.imgur.com/J8KpQN0.gif)

以範例來看，確實最耗時的部分為顯示圖片，接下來可以根據這點進一步確認相關程式碼，進行檢驗和優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687G7BkDIzG1f.png)

### Timeline Events

- 以火焰圖顯示每幀的事件、任務資訊
- 多元操作
  - 使用鍵盤 **WASD** 操控，上下為縮放，左右為移動
  - 框選多幀的工作任務，查看每個任務耗時多久、執行次數
  - 支援 **SQL** 查詢，擷取特定數據
- 在 Flutter 3.10 推出改版，使用 **Perfetto** 開源工具重寫，可處理更多數據，同時性能表現更好

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687yZ9pRWB4O8.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687zjwTvtDSa8.png)

注意：右上角的刷新按鈕，很容易會造成卡頓和網頁崩潰，可能因為資料量太大無法及時處理，這部分可以等待優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687umE1i0XbUi.png)

在 Flutter 可以使用 Timeline 計算事件的運作時間

``` dart
Timeline.startSync("tag")
...
Timeline.finishSync()
```

### Performance Overlay

- 在設備上顯示每幀的即時渲染資訊，包含最高和平均處理時間
- 上方為 Raster Thread。如果超過 16ms，表示場景渲染成本太高
- 下方為 UI Thread。如果超過 16ms，表示 build、layout、paint 成本過夠

![Performance Overlay](https://i.imgur.com/6Z2SLba.gif)

### Enhance Tracking

針對 Timeline Events 進行更詳細的追蹤，可以開啟 **Widget Builds**、**Layouts**、**Paints** 三種模式。也因為要追蹤更多數據，所以開啟後可能會影響 APP 的運行表現，幀數可能下降。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687K5SdL8pJuR.png)

從中也可以更了解 Rendering Pipeline 的整個過程，Build、Layout、Paint、Compositing、Finalize Tree，接著到 GPU 的 Rasterizing 處理。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687XdH5G35mph.png)

#### 1. Track Widget Builds

可以清楚了解這一幀 build 的結果，瀏覽 Widget Tree。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687anERLdqGAI.png)

#### 2. Track Layouts

追蹤佈局排版，所以會看到 RenderBox、RenderPadding、RenderFlex 等等相關角色。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687mYE4RV81Yp.png)

#### 3. Track Paints

追蹤繪製過程中的相關資訊。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687AKbWPYfj3I.png)

### More debugging options

#### 1. Render Clip layers

檢查有關裁剪的相關操作，例如：ClipRRect。屬於昂貴任務，尤其是對於 Skia 圖形引擎 ，濫用可能會造成掉幀、卡頓。

#### 2. Render Opacity layers

檢查不透明效果的相關操作，例如：Opacity、BackdropFilter。屬於昂貴、高成本任務。

#### 3. Render Physical Shape layers

檢查使用 Physical Shape 陰影效果的操作，例如：Shadow、Elevation。濫用也有可能造成效能影響。

以上三個操作對於 Skia 來說成本較高，請適當地使用它們，而對於新的 Impeller 引擎的負擔就小很多，可以等待 Android 穩定釋出，再來觀察整體效能表現。相關細節可以查看其他文章，有關開發技巧，以下是連結：

> - [Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)](https://ithelp.ithome.com.tw/articles/10330647)
> - [Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)](https://ithelp.ithome.com.tw/articles/10331424)

------------------------------------------------------------------------

## 總結

本文從說明何謂 APP 順暢、性能影響因素，再到個別工具的使用，讓大家可以搭配圖片與實際範例更好地去理解。身為開發者都應該懂的如何使用它們，開發過程中使用 Inspector 協助檢查畫面結構與元件細節。接著，在產品需求完成後，可以花一點時間使用 Performance 確認實際的 release 表現，幀數是否正常，是否有 Jank 發生，持續地改善產品，讓使用者有個完美體驗，這應該是開發者都要注重的環節。

DevTools 本身很強大，它的價值可不要忽略囉！

## 延伸閱讀

- [Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)](https://ithelp.ithome.com.tw/articles/10335918)
- [Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)](https://ithelp.ithome.com.tw/articles/10336004)

## 相關資源

- <https://docs.flutter.dev/tools/devtools/inspector>
- <https://docs.flutter.dev/tools/devtools/performance>
- <https://www.youtube.com/watch?v=_EYk-E29edo&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=nq43mP7hjAE&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vVg9It7cOfY&ab_channel=Flutter>
