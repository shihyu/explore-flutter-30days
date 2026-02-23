# Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)

- 發布時間：2023-10-07 19:47:19
- 原文連結：<https://ithelp.ithome.com.tw/articles/10335918>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 22 篇

![](https://ithelp.ithome.com.tw/upload/images/20231007/201206877MGFi7mRZQ.png)

來到了 DevTools 系列的第二章，上一篇我們講解了 Flutter Inspector 與 Performance 用法，使用工具瀏覽 Widget Tree 架構，並了解 UI Thread、Raster Thread 每幀表現，有效幫助我們定位出問題來源。本文延續到重要的 CPU Profiler、Memory 與 Logging，可以知道程式碼與函式的消耗時間，從中思考寫法上是否要改變，再來就是記憶體的使用情況，關乎 APP 運行情況的關鍵數據，透過這些工具去優化產品、改善體驗。如果不知道如何使用或不熟悉的話沒關係，跟著我快速認識並掌握它們！

------------------------------------------------------------------------

## CPU Profiler

監控 **CPU** 使用情況，錄製對 APP 的互動和操作，可以查看每個函式的執行時間，包含 Total Time 和個別的 Self Time，從花費最多時間的部分進行優先檢查和處理，太久可能會導致性能問題。

- **Total Time** → 執行本身之外還包含其他呼叫的相關方法函式，全部所花費的時間
- **Self Time** → 執行本身所花費的時間
- 使用方式：點擊 `Record`，操作 APP 指定流程，點擊 `Stop`，資訊會很快地載入出來  
  ![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GntbwFB1m8.png)

右上角提供了其他操作，包含 **Filter**、**Display guidelines**、**Expand All**、**Collapse All**。很棒的是還能查看其他 Isolate 的運行狀況，從中間下方的選單挑選。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UquTE2Lfup.png)

### Bottom Up

- 顯示表格資訊，從上到下的執行，根據花費時間的多少來排列，可以根據欄位進行排序

![Bottom Up](https://i.imgur.com/inKiJh7.gif)

### Call Tree

- 顯示表格資訊，專注於長時間處理的部分

以範例來看，畫面是在執行動畫，所以可以看到相關的處理函式  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UUSOo3288a.png)

### Method Table

- 瀏覽所有函式的時間佔比，呈現 **percent** 數字
- 點擊每個函式後還可以看到誰呼叫，以及它呼叫了哪些函式

![Method Table](https://i.imgur.com/azJEfwU.gif)

### CPU Flame Chart

- 顯示火焰圖表
- 上層呼叫下層函式，而每個項目的寬度代表實際在 Call Stack 上花費的時間多寡
- 可以使用鍵盤的 WASD 來操作左右以及縮放

![CPU Flame Chart](https://i.imgur.com/rLGLMky.gif)

搜尋框的旁邊有個幫助按鈕 `?`，說明可以執行的介面操作與顏色意義。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687blkTJ0guMs.png)

### Profile app start up

- 載入第一幀之前的 CPU 資訊，可以識別 APP 啟動前是否有延遲。四個 Tab 都會同時載入相關數據
- 使用方式：當 APP 第一時間啟動時開啟 DevTools，並立即到 CPU Profiler 點擊 **Profile app start up**

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687zqqfTs2jHl.png)

### Load all CPU samples

包含 Main isolate 和其他 isolates 的資訊，當要查看其他 isolate 的運作狀況時必須點擊，載入相關資料。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687QPtQAEyy8v.png)

### CPU sampling rate

- CPU 資訊的精細程度，代表 Dart VM 搜集 CPU 樣本的速率，預設為 **medium**
- low、medium、high，三種採樣率分別為 `1,000 Hz`、`4,000 Hz` 和 `20,000 Hz`，素率越高搜集的樣本越多
- 在 high 模式下，因為需要更頻繁地處理數據，取得更多資料，可能會引響到效能表現

在 **low** 模式，進行指定的操作路徑錄製，花費 2.2 秒，蒐集到 114 筆數據，平均51筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687nRa4eqlHlE.png)

在 **medium** 模式，進行指定的操作路徑錄製，花費 1.5 秒，蒐集到 177 筆數據，平均118筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206875m6GDYsPTa.png)

在 **high** 模式，進行指定的操作路徑錄製，花費 2.6 秒，蒐集到 453 筆數據，平均174筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687z2NODODaJm.png)

## Memory

可視化記憶體的使用情況，檢查物件和記憶體，嚴重可能導致 App 崩潰關閉。正常來說，**Dart VM** 會在物件創建時為它分配記憶體，並在 Object 不再使用時釋放內存、清除，這時候會需要 **Dart GC**。

什麼情境下需要使用：

- APP OOM 崩潰
- 幀數下降
- 操作體驗不良，可能速度變慢或沒有反應
- 記憶體異常暴漲
- 記憶體洩漏

> 適合 Profile 下使用 Memory 檢測，Debug mode 表現上會有些許差異

顯示熱視圖，可以放大並詳細查看正在處理、運算的內容  
![Memory](https://i.imgur.com/n2baDQv.gif)

### Legend Board

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687eF8ctCxCxh.png)

#### Events

描述顏色意義，代表每個動作和事件

#### Memory

- **RSS** → 加載到 RAM 中而且可以立即使用的部分
- **Allocated** → 已分配的記憶體，提供給特定工作或進程使用，且不能供其他人使用的部分
- **Dart/Flutter** → Heap 裡 Dart、Flutter 的記憶體
- **Dart/Flutter Native** → Dart VM 佔用原生物件時使用的記憶體
- **Raster Layer** → Flutter Engine 光柵緩存層的記憶體大小
- **Raster Picture** → Flutter Engine 光柵緩存層裡圖片的記憶體大小

點擊虛線就會顯示指定時間點的記憶體資訊，包含裝置的紀錄時間。另外，如果剛好 Dart 有執行 GC 處理，就會多一個藍色點點。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687Nv4bDiuQHJ.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687EinzlM8QPZ.png)

### Time Range

顯示時間區段內的資料。點擊下拉式選單，可以控制圖表上顯示的時間區段，如果時間越長顯示的數據就會越多，可能就會讓操作有點遲緩。

![Time Range](https://i.imgur.com/1zdjWsv.gif)

### GC Manually

在 DevTools 支援手動 Garbage Collecting，即時釋放記憶體資源。  
![GC Manually](https://i.imgur.com/JbZCIan.gif)

### Profile Memory

如果發現有未使用的物件，那這些實體就是內存洩漏的原因，如果超過設備的可用記憶體容量，APP 就會崩潰。我們可以從表格觀察物件的 **Instances count**、**Total Size**、**Dart Heap Size** 了解記憶體使用狀況，透過欄位幫助排序，更快地找出原因。  
![Profile Memory](https://i.imgur.com/f7a8jSJ.gif)

可以導出 CSV 報告文件  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206872X4Il9qNgl.png)

### Diff Snapshots

根據當前的 APP 狀況進行快照，擷取所有記憶體使用資訊。可以搜集兩個場景的狀態，使用 Diff 進行比對，可以看到 Instance 數量和記憶體大小的變化，有差異的話前面會有正負號。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GfMMiDoQVX.png)  
![Diff Snapshots](https://i.imgur.com/yLo3wNK.gif)

### Trace Instances

追蹤指定 Class 的變化，了解實體數量，並附帶佔比，讓我們更了解實際情況。經由 **Bottom Up** 和 **Call Tree** 瀏覽被使用的時機點，資訊被描述的很清楚。

使用方式：

1.  選擇要追蹤的 **Class**
2.  在 APP 進行一些場景操作
3.  點擊 **Refresh**
4.  查看 **Instance** 變化與詳細資訊

以下圖示官方提供。實際使用時 DevTools 會崩潰，無法附上實際 APP 運作狀況，先回報官方等修復。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687rZ5PX0gHWS.png)

### 幾個記憶體優化的習慣

#### 1. WeakReference

- 使用 **WeakReference**，儘管有指向也允許隨時被 GC 處理
- 用來存取值的 `target` 屬性，可能會是 null，要進行額外檢查
- 如果物件在很多地方被使用的話，必須注意它是否有被 GC 釋放掉

#### 2. Create object lazily

- 對物件延遲創建、初始化，在需要時才存在
- 使用 `factory constructor`、`getter`、`late initializer`

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687FhykQzstNY.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GJckRb2TWi.png)

#### 3. Discard resources

- 確保在 `dispose()` 裡有準確釋放物件、資源
- 可以宣告物件為 **nullable**，在 `dispose()` 後給予 null，標示為可以被 GC

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687lygddQbLBV.png)

#### 4. Use const constructor

- 在 compile-time 編譯時就確定
- 當有多個相同屬性欄位的物件和元件，它們實際上是同一個實體，記憶體消耗也只有一個
- 在 **debug mode** 的情況下兩個相同的 const 物件因為有 debugging tools 所以不會相同，但是在 **release mode** 會是相同物件

## Logging

- 監控運行時生成的訊息和 Log 日誌，有包含標記，資訊更完整，可進行更細微的檢查
- 查看 Dart 和 Flutter 資訊，從 `Kind` 藍為辨識，例如：**Dart GC**、**Flutter Framework**、**Image**，還有我們的自定義的訊息
- 善用搜尋框，即時反應、速度非常快，可以根據類型、關鍵字輸入

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687JmdPL7Yxqe.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UrvC8xY1tn.png)  
![Logging](https://i.imgur.com/9thNFOU.gif)

- 根據 Kind 種類進行過濾，使用 `k` 代表，以逗點來設置多個關鍵字

以下範例查看 Framework 相關資訊：  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687oX2QriQqoF.png)

### Flutter Log Printer

- 使用 `debugPrint()`，保持訊息的完整，不會被截斷
- 在 Logging View 裡面的種類為 `stdout`

針對 Production 環境設置，確保在正式環境不會紀錄 log 資料，避免資料洩漏：

``` dart
void main() {
    if (isProd && kReleaseMode) {
      debugPrint = (String? message, {int? wrapWidth}) {};
    }
}
```

------------------------------------------------------------------------

## 總結

相信到這裡大家應該更知道如何使用它們了，官方團隊持續地在進行優化，結合目前的 Material 3 設計，重點就是要讓開發者更方便地去使用，不管是 UI 還是檢測功能都完整了。我們當然不能忽視它，DevTools 的 **CPU Profiler** 與 **Memory** 是核心功能，APP 的效能表現一目了然，不要因為自己的手機順暢就覺得沒有問題，每位用戶的裝置、配備可是差異很大。有關 Object 數量、時間消耗、記憶體變化，每個環節都可能會導致應用卡頓，需要我們在開發時特別注意，所以效能調校、優化產品是非常重要的。我們不只要完成一個產品，還要完成一個好的產品，你說是吧！

## 延伸閱讀

- [Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)](https://ithelp.ithome.com.tw/articles/10335311)
- [Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)](https://ithelp.ithome.com.tw/articles/10336004)

## 相關資源

- <https://docs.flutter.dev/tools/devtools/cpu-profiler>
- <https://docs.flutter.dev/tools/devtools/memory>
- <https://docs.flutter.dev/tools/devtools/logging>
- <https://www.youtube.com/watch?v=_EYk-E29edo&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=nq43mP7hjAE&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vVg9It7cOfY&ab_channel=Flutter>
