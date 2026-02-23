# Day 30: The End to Start, Be a Contributor

- 發布時間：2023-10-15 20:43:12
- 原文連結：<https://ithelp.ithome.com.tw/articles/10339903>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 30 篇

![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687qboehPkgez.png)

嗨，大家好，再次自我介紹，我是陳虔逸、Yii Chen，一位 Flutter 愛好者以及推廣者，專注跨平台開發，除了投入技術寫作外，也是活躍講者。擁有 7 年 Mobile 經驗，開發過大大小小的 APP，從 Android、iOS 到近期深耕 Flutter，包含結合IOT、藍芽BLE、購物、交友、健身等等應用，致力於開發出高品質且體驗豐富的產品。除了本業外，也擔任 Flutter Taipei Organizer，經營四千人的開發社團，鼓勵大家參與社群，並擁抱開源，擁有正向積極的影響力。

很開心能夠再鐵人系列的最後一篇見到你/妳，沒想到時間過得這麼快。如果你是從一開始追到最後，請私訊我，我會給予一個特殊獎勵，也感謝關注。

從標題得知，鐵人賽系列的結束，對我來說是個開始，為什麼呢，讓我跟大家分享一下。

相信大家都知道 Flutter 從 2017 年亮相到今年才短短幾年，六歲而已(補充一下，Dart 很早期就有了，10/10 誕生，目前已經 12 歲囉，讓我補個：生日快樂 Dart !)，Flutter 對於原生 Android、iOS 或其他領域還算是小孩子，是一個較新的技術，所以相對的資源、開發人員比較少，尤其在台灣，人數當然是更少，前期願意嘗試的開發者不多，不過這兩年，越來越多的原生朋友轉換到 Flutter 領域，越來越多人開始了解 Flutter 是什麼，很多學生首次接觸 Mobile 開發就是 Flutter，很多企業也使用跨平台技術來提高效率與節省成本，各項數據都逐年成長中，對於一個早期加入人員，我個人是很感動也很開心。

隨著 Dart 3 在五月的穩定釋出，也代表 Flutter 專案、產品的穩定性提升，少數符合 100% sound-null safety 的語言，除了安全風險降低之外，編譯也更有效率、速度更快，包含幾種新的語言特性，可以看到官方對於大家的心聲從不忽視，持續的改變為了讓開發者能受益，讓社群對於 Flutter 與 Dart 團隊都很放心也很有信心。

目前 Flutter 套件平台 **[Pub.dev](https://pub.dev/)**，也有上萬個套件可以使用，前 1000 個主流選項都已經支援 null safety 了，讓所有開發者在選擇上都不用擔心，相信使用了排名前面的這些套件，應該能幫你解決大部分的問題與功能需求。也鼓勵大家能給予套件按讚，每個維護者都很辛苦，有不足的地方也多多提 issue，讓大家幫忙改善。

原先的一些劣勢，在這兩年開始已經完全不同了，Flutter 目前擁有 Github 開源專案的前五名星星數，截至今天為止為15萬7千多(快9萬個Issue，有76102修復)，這些都是官方與社群共同努力的結果，可想而知有多少人在關注 Flutter，使用它來開發專案與產品，而在 Stackoverflow 每年的調查報告裡，今年的 Other frameworks and libraries 分類，Flutter 正式進入前十名，非常值得開心的一件事，也是第一次超越相同領域的 React Native，值得紀念的一刻。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687IziYIsNRVU.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687K81XqKfcC6.png)

> - [Flutter](https://github.com/flutter/flutter)
> - [Stack Overflow Developer Survey 2023](https://survey.stackoverflow.co/2023/#worked-with-vs-want-to-work-with-misc-tech-worked-want)

在 2023 Flutter Strategy 裡面有提到，截至今年 1 月，Play 商店中有超過 700,000 個 APP 是使用 Flutter 開發的，而在新應用中，有五分之一使用 Flutter，比其他跨平台框架的總和還要多，而到目前為止，Flutter 開發者有六百多萬人以上，總共已發布了1百1十萬個APP。就我了解，除了歐美，目前印度、印尼、非洲等國家都有大家發者持續加入，當地很多學校、新創都開始使用 Flutter 開發產品，也進一步幫助 Flutter 的發展，影響力擴大中。從中可看出目前對於市場與開發者來說，Flutter 這項技術是首選或是一個更好的選擇。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687D1phIuVsLB.png)

> [2023 Flutter Strategy](https://docs.google.com/document/d/e/2PACX-1vRknZ4Jkc-pWSMsDDyKwMrry7k2BSL_I94JCCQrg8FiHuy4fcypkgIVFbQVKPmzDQHfd20uZf2rFiXP/pub)

對於 Android 用戶，如果想要知道手機內有沒有 Flutter APP，可以下載 Flutter Shark，它可以幫你偵測，並列出 Flutter 與 Dart 版本，接著還能列出 APP 有使用到的套件，很有趣且資訊很裸露的應用。iOS 用戶就沒辦法了，裝置無法做這些事情。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687lhefBMgVcy.png)

> [Flutter Shark](https://play.google.com/store/apps/details?id=com.fluttershark.fluttersharkapp&hl=en_US)

目前市場上知名的 Flutter App，以下列出一些給大家參考：

#### Google

- Google Ads
- Google Pay
- Google Analytics
- Google Classroom
- Google Play Console
- Google Cloud
- Youtube Create
- Google Earth

#### Other

- Wolt(芬蘭的 Uber Eat)
- Grab(東南亞版本的 Uber)
- NuBank(巴西的銀行 APP)
- SNCF Connect(法國的交通 APP)
- CA24(法國的銀行 APP)
- Binance(Web3 APP)
- Apex(Web3 APP)
- …

#### Flutter Consultant

官方新增了 Consultants 頁面，列出國際上聲量好且穩定的 Flutter 團隊與公司，例如：VGV、gskinner、Somnio、BAM、IBM、Rebel App Studio 等等，它們專門協助客戶解決產品與開發問題，其中也有包含開發者培訓。其中 IBM 在近幾年運行了 IBM Flutter 團隊，其中提到選擇 Flutter 的主要原因是開發速度與品質，尤其讓團隊在兩週內發布西班牙的新聞產品。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687KNICT8U64j.png)

------------------------------------------------------------------------

OK，前面幫大家補充了 Flutter 目前的現況，回到主題，為什麼要當個貢獻者？為什麼想要參與社群？很多人問：『你都不會累嗎，都沒有休息出去玩為的是什麼？』

這些問題其實很好回答，就是，因為我喜歡，喜歡開發 Mobile，喜歡 Flutter 這個技術的理念與魅力，所以平常很自然的都會在 Medium 撰寫學習記錄、分享開發經驗、蒐集最新消息，對我來說花這些時間都很值得，其實累不算什麼。因此在 8 月多的時候，看到了鐵人賽的資訊，其實原本沒有特別興趣，因為平常都有在輸出，只是平台不同而已，直到 9 月比賽快開始前夕，看到 Mobile 領域的參賽者，Flutter 在其中比原生領域的人還少一點，此時我心中覺得不行，需要更多內容讓大家瀏覽，讓 Flutter 被大家了解的機會多一點，所以就報名了，至於有沒有得名、有沒有獎勵不是那麼重要。

到了最後一天，鐵人賽的參賽心得呢，我個人覺得是時間，剛好這兩個月除了工作之外，還有 Side Project 產品、Flutter Taipei 社群經營、準備研討會等等，過程只能說刺激有趣，當然也是累呀哈哈。鐵人系列的主題在一開始就差不多都制定下來，挑選與撰寫的方向，主要朝著能幫助其他開發者為主，從基本觀念、源碼分析、動畫細節、開發技巧、狀態管理、自動化測試、設計系統，最終兩個月也順勢生出了四十幾篇文章，其他部分(架構、安全性、CICD、代碼分析..)後續會再其他平台釋出，大家可以關注一下，記得追蹤 Flutter Taipei Medium，掌握最新消息。

其實開發一個 APP 需要的元素有很多，不單單只是刻出畫面、完成功能，最終還是追求一個好的產品，有質感讓人喜歡的產品對我來說更為重要，這些是 for 使用者端，那我們開發者呢，當然要想辦法將無聊、重複的任務轉換為自動化，如何讓團隊很順暢有效率的開發 Flutter APP，就是另一個重點了。希望分享的內容有幫助到大家，從系列主題來看，三十天其實遠遠不夠，目的是期望能夠引導每位開發者往進階的道路前進，持續提升相關技能，不再只是敲敲鍵盤的工程師，我想當你願意點進來此系列，也就代表你自己也願意成長，非常歡迎有任何想法都提出來討論，我們能夠一起交流一起前進，我很樂意跟大家互動。

那前往進階的道路上會有什麼好處？你說反正公司不會在意這麽多，底下的人有完成功能、完成任務就好，客戶開心大家都開心，哪有時間寫測試或是在意要不要成長？說的也沒錯，當然身為員工做好本分是基本，賺錢養家才重要對吧？但提升自己有壞處嗎，當然沒有，以分析源碼為例，了解官方和其他開發者的寫法，可以促使我們更清楚背後的運作原理，資料的流動。以 Flutter 來說

1.  **Widget** 本身是什麼？
2.  **BuildContext** 實際上 Element，所以元件可以在樹上訪問 Parent 做一些操作，存取到 **InheritedWidget**。那 **RenderObject** 如何實作？
3.  **Element**，`updateChild()` 在不一樣的情境下做了什麼事情
    1.  原本沒有 Widget 下一幀有
    2.  原本有 Widget 下一幀沒有
    3.  原有 Widget 更新配置
    4.  原有 Widget 更新成不同類型的 Widget
    5.  原有 Widget 沒有變化
4.  **Layout Flow**，”constraint go down, size go up, parent set position”，在 build 和 layout 階段使用 `One Pass algorithm` 的次線性性能是 Flutter 一個重要的優化
5.  **Rendering Pipeline**，Animate → Build → Layout → Paint → Layer Tree → Compositor → Raster → Pixel，到最後執行 `finalizeTree()` 清理資源
6.  ……

當我們了解其中概念，可以很好地幫助到開發，發生問題時知道原因為何，不會覺得莫名其妙為什麼。當聊到相關話題時，我們能參與並分享一些想法與經驗，尤其是面試，應該沒有人不需要吧，除了過往的產品經驗外，對於所在領域的了解程度是個很大的考量，在不在意每個需求和問題，它們為何出現、如何解決，只有我們深入去瞭解 Dart 與 Flutter 後才能正確地給予回覆，除了 SDK 本身，有關安全性、自動化流程、Design System、測試技巧等等，當主動提出這些想法，能跟工程師、主管聊天的時候，對於期望的薪資和位置應該就不是太大問題了，對方也會了解求職者的企圖心與學習心態，重點還是在於有沒有重視自己的能力，和正在追求的目標，所給予的眼光會有所不同。

------------------------------------------------------------------------

有些人可能為了想貢獻社群而參加比賽，有的人想有個鐵人紀錄而參加，也有的人單純想分享經驗，這些出發點都很棒，我自己本身很敬佩願意分享的開發者，這些需要經驗和時間才能產出的內容，對於社群和讀者來說是個很棒的學習資源。而在這裡我也整理了幾個分享與撰寫文章的小技巧：

#### 避免長度過長

在這個時代，現在短影音的流行，每個人都在滑抖音、Short，大家已經習慣短時要間取得重點，當然遮裡不能相提並論，族群、類型都不同，而技術文章也有它本身的價值，我的個人經驗與目前作法，維持文章在15分鐘內能閱讀完，或是兩個主題內，但最終還是取決於對內容的敘述想法，而時常在 Medium 上會有大概標示，如果內容很多也可以區分的話就盡量分為 part1 ~ partX，除了能讓人比較沒壓力的閱讀之外，讀者也會覺得有完成一件事情的感覺，過程中會得到成就感，而不是感到很長的文章就選擇放棄。

#### 重視舒適性

撰寫的過程中，標點符號的使用很重要，跟說話一樣，該斷的時候斷，避免一直使用逗號去分隔，當轉換情境、話題的時候就使用空行進行分隔，讀者也能順勢休息，這時候可以喝個水或是上個廁所，淺意識其實會有提醒作用，或是並將此段落記錄下來，下次打開文章時可以很快地掌握相關記憶。

另外圖文交錯也是一個方式，當有可以代表話題以及段落的東西就能放在後方，除了讓讀者想像外也能實際了解作者在分享的內容，有幫助記憶的效果。尤其時內容抽象感很重的話，例如：說明專案架構時需要的目錄架構圖、IAP 購買流程圖、體重紀錄後分析的時間圖表等等，圖像能讓讀者增加好感，不只是參考其他文章或文字說明外，同時也會覺得作者很用心。

#### 圖片與影片

上一項提到了舒適性，跟圖片和影片有大大關係，內容必須確保清晰且關注重點，如果再說明程式碼的狀況，就專注特定區塊即可，不需要將旁邊不相關的畫面擷取進來，有效增加閱讀體驗。而如果操作流程是持續動作的話建議錄影，可以的話進行影片裁剪，只保留重點片段就好，保持一個重點，就是簡潔有力。除了影片外可以將它轉換成 GIF，優點是體積比較小，因為平台通常會限制容量，不可能讓使用者隨意上傳大型檔案，例如：Medium 最大允許為 5mb。除此之外，GIF 還支援自動循環重播，這是一個很棒的讀者體驗。

> 個人常用的工具 **Gifski**，除了能裁剪之外，還能調整尺寸、幀數、品質，可以很好地控制輸出大小，生成速度也很快，個人非常推薦

#### 引用參考

我們總是站在巨人的肩膀上去學習，公開的資源非常多，有課程或是閱讀其他開發者的經驗，加上自己的想法後產出屬於的自己的知識，建議如果想參考其他作者的圖片或文字，都要加以調整再撰寫，圖片也是，可以內容差不多但是要以自己的繪製版本呈現，就跟寫論文一樣，我們被允許參考但同時也要給予尊重，最起碼基本的 shout out 要有，或是標示出處，在結尾提供相關連結，良好的開源文化需要被建立，需要你我一起維護它。

------------------------------------------------------------------------

為什麼想貢獻社群？其實從幾年前開始我開始發布一些 YT 教學影片，從 Android、iOS 到 Flutter，也有持續在寫東西。一開始只是為了學習記錄，遇到了很多開發上的問題，對於記性不好的人這是一個很棒的方式。而另一個想法是覺得這個問題應該有其他開發者也會遇到，如果有人因此受益、能幫助到他們，那很棒，沒有的話也沒關係，反正就是自己的筆記而已，沒有想這麼多。當紀錄越來越多後，開始收到很多開發者的訊息，它們留言跟我說謝謝，還會私訊跟我聊天，甚至就因此認識變朋友了。從來沒想過說自己能間接影響到其他人，幫助到他們，尤其很多還是國外朋友，從中我獲得非常大的成就感，覺得原來持續做的事情其實很有價值，也讓我保持著這樣的心態想要持續分享。

↓ 結果以前發布的 Spotify 運行問題，是現在最多人關注的文章，因為只要用 M1 的朋友都會遇到，內容只花了十分鐘就完成.. 從這個時候發現，原來自己也能有正面的影響力  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687ztjMH0FXOI.png)

↓ 早期的 YT 影片，每週上一個原生教學，以前真的很生疏，是個累積經驗的過程，不時會收到一些道謝留言  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206875qc5YkP7qu.png)

↓ 很多人找到我的 IG 跟我聊天。也有國外開發者使用了套件，並跟我說聲感謝，每次收到都覺得感動  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206874hs4MDocBP.png)

↓ 分享了 Widgetbook 文章，關於元件庫的維護，結果創辦人來留言，願意給予使用與分享上的幫助。受寵若驚的一刻，接下來可能會合作，可以期待  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687qZlffM9Ctt.png)

#### 經營社群

從二月開始，想要經營社群，因為看到國外的社群氛圍，這兩年辦了非常多大型活動，包含歐美、印度、非洲、杜拜等等國家，很多開發者都願意分享自身經驗，聚會都很多人參與也很有趣，這時就覺得台灣也應該這樣。也因為當時台灣還沒有活絡的 Flutter 社群，沒有相關活動能夠參與，我主動跟 GDG Taipei 聯繫，後來就有了每個月的 Flutter Meetup，到十月已經是第九場了，這過程讓人感到欣慰。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687IAVwcyUaEB.png)  
(Kevin, 斌權, 志剛, 家豪, Yii)

而在年中 Flutter Taipei 與我們聯繫上，因為因緣際會，順勢承接這個元老 Flutter 社群，跟我的初始想法一致，讓我們現在能夠有更大的影響力去推廣 Flutter。成員因為喜歡而聚在一起，即便很累也願意做這件事，不覺得很熱血嗎？！初代成員幾乎都是女生成員，真的很酷很棒，同時感謝他們的努力，我們也才能夠延續 Flutter Taipei 的精神。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687xIHsosJ39P.png)  
(Flutter Taipei)

也因為社群接觸到了認識很多開發者、專家，以及遇到很多新的機會。例如在 Firebase 影片上看到的 **Andrea Wu**，一位負責 Remote Config 的工程師。她對於工作的熱誠，做著自己喜歡的事情，那種滿足從語氣中能感受得到。跟她互相分享生活以及想法，很感激那次的機會，受鼓舞很多。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687sqPcFrkT9t.png)  
(Yii & Andrea)

受邀到 Google IO Extended 上分享 Dart 以及 Flutter，很棒的體驗，同時認識了 Firebase GDE - Richard 大，分享了很多投入社群的想法，也鼓勵我繼續朝著目標前進，真的非常感謝。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206871qAJvfJa5E.png)

參與今年的 **COSCUP**，與 GDG Taipei 合辦，學習擺攤經驗，認識許多新朋友與開發者，鼓勵大家多多參與。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687747RIpkCqE.png)  
(小啄 & Dash)

而在近期也獲得官方團隊給予的獎勵，竟然收到了 Dash 娃娃，沒有想過這一天什麼時候會到來，這是無法預期的一件事情，也是身為 Flutter 開發者的榮耀，對我來說非常重要，也很激勵我繼續經營社群，推廣 Dart 與 Flutter。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687TcNQ9ZYNzR.png)  
(Flutter Swag)

以上分享的種種，說了非常多，都是基於接觸社群後出現的事情和機會，很多事你無法預測，只要跟著心中想法去前進，好像自然就會到達新的目的地，這些就是社群帶給我的好處，從中受益良多。

#### Input then Output

以前剛開始進入程式領域的時候，那時的我擁有什麼知識或想法都覺得很寶貴，它屬於我的所以完全不想讓別人知道，因為怕被別人學走，花了這麼多時間結果被人家抄襲，也導致那時候比較封閉，學了一些東西後就覺得很厲害。殊不知，當我們沒展現出來的時候，根本不會有人知道原來你懂，就像自嗨的感覺。所以為什麼鼓勵大家不管在什麼領域、在公司，有想法就應該勇於提出，團隊才能即時將你的意見納入考量，可能你想到的其他人沒想到，同時大家也能知道你的用心，在群體中的被信任感也會隨之提升。

而自從接觸社群，開始跟國外開發者交流後，才發現原來歐美那邊的開源氛圍這麼的棒，大家很主動地會在社交平台上分享，幫忙轉發，從任何技術的大小事、開發經驗到公司使用到的技術，積極參與研討會，並花很多心力在開源專案上，讓我學到非常多。這時候也才知道，原來厲害的開發者和專家，它們不僅自身要求高以外，對於開源的影響力越大，保持穩定的輸入和輸出。當然不是每一位都如此，但至少大家秉持一個信念，就是不要浪費時間在重複的事情上，我們開源就是為了要解決問題，一起討論一起維護，改善領域技術，最終大家一起成長，並持續邁步前進。

對於開源專案和資源，我大部分都將所有的資訊開放到 Github 上，也製作了 Flutter 相關套件，身為作者，維護是一件辛苦的事情。初衷是需要，所以製作出來希望能夠幫助其他開發者，在大家使用後，社群會許願很多很棒的功能，也幫忙找出問題，本身是非常感謝。但實際上大家都有工作，沒有報酬的關係，要持續的維護以及更新真的有點難，比較難排出時間去處理，難免長時間下來到後面會有點無力。因為自身理解，所以想跟大家分享，每個人都應該尊重作者與維護者，事實的給予讚美和捐助，對於環境才有正向的循環，也能讓相關人員更有動力的去前進。

以下是中國 Alex 大，接手 Dio 後的每日行程，很讓人敬佩的一位開發者。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687P7iNHJaW3J.png)

此時，對我來說，鐵人賽分享只是一個很短暫的過程，跟大家每天奮鬥發布文章確實熱血。接下來會一樣會持續輸出，相關內容都會轉換為英文上傳到 Medium，不管國內外開發者都能接觸到，有什麼想法都能到上面留言給我。除此之外，還有 IG 跟 Twitter，主要分享即時的開發消息和一點點工程師生活。

Flutter 目前持續成長中，這個技術在全世界，以及跨平台領域給予大家深刻的印象，它的影響力很廣，也確實能透過它解決問題、實踐心中想法，越來越多人加入後，已經逐漸成為主流了。不過台灣目前公開的資源有限，還需要更多朋友投入進來，不管是推廣技術、文章分享、參與實體活動等等，都需要大家的協助。只要你有想盡一份心力，都歡迎跟 Flutter Taipei 或是我聯繫，可以在官方 Medium 分享經驗，或是成為活動志工，相信加入後絕對能感受到不同的體驗，並從中獲得成就感。我們一起加油，一起成長！

------------------------------------------------------------------------

現在 Flutter Taipei 定期會跟 Flutter 官方互動，了解正在執行或即將釋出的資訊，我們都會發佈在 FB 社團。目前每個禮拜有 Live Coding、每個月月底有 Flutter Meetup(接下來有可能請到國外開發者來分享)，而在年底我們預計會參加 Google DevFest 2023，到時候內容有工作枋和演講議程，歡迎開發者來一起參與，保證不會失望。以下是 Flutter Taipei 相關連結

- Facebook: <https://www.facebook.com/groups/flutter.taipei>
- Medium: [https://medium.com/flutter-taipei](https://medium.com/flutter-taipei?fbclid=IwAR2u2Th7yqDR9jCwwxC6v6gnjNUDZ6r3ZHzIty8bu1SsR4tZDNrxNptZd0s)
- Discord: [https://discord.gg/wssuh9kujB](https://discord.gg/wssuh9kujB?fbclid=IwAR1hnpXG2K5hgj-PIOlND7ESFUQ-_pYgkDTTw4uYqPxys-DSjWt5GWvD_OE)
- Twitter: [https://twitter.com/FlutterTaipei](https://twitter.com/FlutterTaipei?fbclid=IwAR1AhW-uUUc18gfAagHYAgGLbwRT80zx9ABkJY4LIrGmKgMBkRFUEk18_DE)

附上我的相關資訊，也歡迎交流和追蹤：

- Medium: <https://yiichenhi.medium.com/>
- Github: <https://github.com/chyiiiiiiiiiiii>
- Instagram: <https://www.instagram.com/flutterluvr.yii/>
- Twitter: <https://twitter.com/yiichenhi>
- Linkedin: <https://www.linkedin.com/in/yiichenhi/>
- Youtube: <https://www.youtube.com/@a22601807/videos>

![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687COfrQk73Wc.png)
