# Day 41：嗟乎！從外到內看 Flutter 渲染引擎｜Skia → Impeller

> 原文來源：[Day 11：嗟乎！從外到內看 Flutter 渲染引擎｜Skia → Impeller](https://ithelp.ithome.com.tw/articles/10328281)

我們都知道，Flutter 之所以能夠擁有跨平台的能力，都必須感謝於他不依賴平台的 API 本身，而是依賴於渲染引擎，早期是 Skia 現在開始面向 Impeller。那什麼是渲染引擎？他又是怎麼在 Flutter 中發揮作用的呢？


### Flutter 渲染基礎


首先要理解渲染的關係，就必須先知道關於 Flutter 三棵樹的意義，而這部分已經很多人有寫過深入的文章，我們這裡就只做簡單的介紹，還是把重點放在渲染引擎上面。關於三棵樹的關係可以簡單理解為：


- **Widget**：在 Flutter 中，`Widget` 是一個描述 UI 的不可變配置。它本身不進行任何繪畫或佈局操作。

- **Element**：當 `Widget` 被"插入"到 UI 樹時，它會透過 `createElement` 創建一個相應的 `Element`。`Element` 是 Flutter 的框架層的一部分，它代表框架與 `Widget` 和 `RenderObject` 之間的橋梁。

- **RenderObject**：當涉及到實際的佈局和繪畫操作時，`RenderObject` 就派上用場了。它知道如何測量自己（佈局）以及如何繪製自己。


現在我們知道在 Flutter 中，創建 Widget 後，是透過 RenderObject 來告知渲染引擎要如何把畫面繪製到螢幕上。那這中間的步驟大概是什麼樣子的呢？


下面兩張圖片來自於 [Flutter 的官方頻道](https://www.youtube.com/watch?v=vd5NqS01rlA&t=62s)，我們在畫面上創建了 FlutterLogo 這個 widget，而 Widget 也會產生對應的 RenderObject ，而這些 RenderObject 們擁有各自不同的實作，會形成一個 Render Tree。Render Tree 產生後再把這些轉譯成為繪製的語言，也就是 Display List 要做的事情，最後透過渲染引擎去做渲染，然後呈現在畫面（Surface Texture）上。


![](https://ithelp.ithome.com.tw/upload/images/20230926/20117363d5m3WsuCIi.png)


![](https://ithelp.ithome.com.tw/upload/images/20230926/20117363Xx2YvKhxFQ.png)


### Skia → Impeller


從上面的講解我們可以知道，渲染是如何發生的，那為什麼 Flutter 要替換掉 Skia 轉向自家的 Impeller 呢？當中有很多原因： Skia 作為一款通用型的引擎並不能很好的針對 Flutter 需要的特性做更改，但當中最大的原因當然是  shader compilation jank 的問題。


### shader compilation jank


compilation jank 是長久以來 Flutter 一直存在的問題，因為 Skia 在渲染 Render tree 的時候是即時在 GPU 上運算的，如果遇到比較繁雜的動畫這個運算過程可能需要幾百毫秒，離 60 fps 所需要的 16 毫秒要長的的多（何況現在越來越多手機支援 120 fps），由於這些計算的問題，就會產生畫面卡頓的感覺。


為了要深入理解 Impeller 是如何解決問題的，要介紹一下 Impeller 的渲染流程，如同我們上面所介紹的，FlutterLogo 這個 Widget 在產生 RenderObject 並且轉化成繪製路徑的時候，就是引擎介入的部分，對於 Impeller 來說，每個繪畫的步驟如：DrawPathOp 都會產生跟實體（Entity），而每個實體就包含他要繪畫的內容，這些要內容要通過哪些繪圖指令來實作，會寫在 Contents 裡面，所以對於不同類型會對應不同的 Contents 來完成繪畫的指令。


![](https://ithelp.ithome.com.tw/upload/images/20230926/201173639lnWvct1lJ.png)


來看一下 Impeller 整體的架構，Display List 首先透過 Aiks 來產生 Entities 並完成繪圖指令，再透過 Hardware Abstraction Layer 會根據不同的平台，去呼叫不同的繪圖 API，如 Metal 就是 iOS，Vulkan 是 Android 的繪圖 API，最後把效果顯示到畫面上。


Aiks 其實就是 Skia 反過來，團隊也是蠻會玩梗的


![](https://ithelp.ithome.com.tw/upload/images/20230926/20117363nKABgq0pxX.png)


那麽 Impeller 透過這樣的架構帶來什麼樣的好處呢？首先最大的好處當然是 Contents 現在包含自己要繪畫的指令，就可以讓 GPU 去平行處理每個 Contents 達到效能的優化。另外一個最大也是最有感的好處，就是 Impeller 是可以提前去處理這些編譯過程，在 build 的期間就去完成編譯的動作，減少原先 shader compilation jank 的問題，相信用過的人都很有感，對於複雜畫面的繪製都是有感提升。


### MSAA 抗鋸齒


除了繪製的特性以外，Impeller 還支援了 MSAA 抗鋸齒的特性，那什麼是抗鋸齒呢？抗鋸齒是電腦圖形學中一個重要的技術，目的是消除或減少圖像中的鋸齒狀邊緣，從而使圖像看起來更加平滑和真實。在談到 Impeller 的抗鋸齒技術之前，我們首先要理解何謂鋸齒狀邊緣以及為什麼它會出現。


**鋸齒狀邊緣是什麼？**


當我們在低分辨率或低像素密度的顯示屏上呈現斜線或曲線時，由於像素的方形結構，我們通常會看到不平整的邊緣，這些邊緣稱為“鋸齒”。這是因為嘗試將平滑的線條或曲線映射到方形的像素網格上會導致某些像素部分被填充，這會產生不連續的邊緣。


**什麼是 MSAA？**


MSAA（多重取樣抗鋸齒）是一種抗鋸齒技術，目的是減少鋸齒狀效應。它的工作原理是在每個像素中多次取樣，通常是2、4或8次，並基於這些取樣結果計算出最終的像素顏色。這意味著，對於那些邊緣像素，將考慮更多的信息來確定它們的最終顏色，從而使邊緣看起來更平滑。
![](https://ithelp.ithome.com.tw/upload/images/20230926/20117363nrCHQIcO9L.jpg)


基於這個特性的需要 Impeller 也發展了每個像素點可以儲存不只一種顏色，所以能對混合顏色表現得更好，例如，考慮一束光線從一個光滑的表面反射。該光線可能會被分散，並與其他光線混合，從而在像素中產生多種顏色。有了 MSAA，Impeller 可以確定這些像素中的最佳顏色，使反射看起來更加真實。
![](https://ithelp.ithome.com.tw/upload/images/20230926/20117363MEGpBDXuWQ.png)


### Impeller 的未來展望


Flutter 團隊不僅因著解決 shader compilation jank 問題而推出 Impeller。從 Impeller 的設計和架構便可見，Flutter 團隊野心勃勃，希望把它塑造為一個高度擴展性的渲染引擎。持有 Flutter 的跨平台優勢，再加上其現有的 3D 和抗鋸齒技術支持，Flutter 似乎不僅滿足於成為一個應用開發平台。他們的視野可能還指向遊戲產業的浩渺天地。而作為一名熱衷於遊戲開發的人，我自然期待且支持他們的每一步前行！


## 結語：


透過今天的探討，我們了解了Flutter背後的渲染引擎之變革，從Skia到Impeller。這不僅反映了技術的進步，也展現了Flutter不斷追求優化與創新的決心。每一次的技術選擇，都是為了更好地服務開發者和使用者。希望今天的文章有讓你們大概理解到繪圖引擎的做法，明天見！
