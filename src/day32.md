# Day 32：什麼？你都在正式環境上開發！：Flutter Flavor 設定 🧄

> 原文來源：[Day 2：什麼？你都在正式環境上開發！：Flutter Flavor 設定 🧄](https://ithelp.ithome.com.tw/articles/10319678)

在軟體開發中，一個好的實踐是有多個環境，通常包括至少一個開發（或稱為「dev」）環境和一個生產（或稱為「prod」）環境。然而，不幸的是，有些開發者直接在生產環境中開發和測試新功能，這是一個相當冒險和不可取的做法。


```
🌝 本文將包含：
✔ 為何多環境在 Flutter 開發中至關重要。
✔ 傳統多環境管理方法的缺點。
✔ 官方使用 Flutter Flavor 的步驟。
✔ Flutter Flavorizr 自動化管理 Flavor 步驟
✔ 下一篇預告：Flutter 中的 CI/CD

```


## 為什麼需要多個環境


**1. 安全的測試環境**


如果你的專案只有一個正式版的開發環境，不管是你或是測試人員，可能在很多條件的限制之下，只能躡手躡腳小心的測試，深怕自己成為弄壞環境的始作俑者。但這跟我們測試的目的恰恰相反，測試就是要窮盡可能性，去確保軟體的品質。


**2. App 需要上架的時間更長**


在做 App 的開發時，比其他任何環境都更需要使用 Flavor 做分層設計。如果是在 Web 或是 Backend 上出現錯誤，你還可以連夜修改搶救，但 App 發布了以後，你很難在第一時間就上版補救，只能任由事情發生（後面章節還會提到 Feature flag 的重要性）。


**3. 增加迭代速度**


在軟體開發過程中，迅速地完成並交付新功能以供測試和使用是一個重要目標。當我們擁有多個開發環境，特別是在 dev 環境中，我們可以更早地部署和測試新功能。這不僅提高了開發效率，也讓團隊能更快地收集反饋並做出相應的調整。


不要小看任何的微小改變，為團隊撬動的槓桿是非常巨大的。有了更靈活的開發環境，最直觀就可以帶來這些好處。


- 提前發現問題：更快的迭代意味著更早地發現潛在的缺陷或問題，從而更早地進行修復。

- 快速適應市場：能夠迅速交付新功能或修正問題，使產品能更快地適應市場需求和變化。

- 增強競爭力：快速迭代和更新意味著您的產品或服務能夠更快地提供創新解決方案，從而在競爭激烈的市場中脫穎而出。


## 早期的做法


在尚未接觸過 flavor 前，我也試過使用多個`main.dart`檔案來代表不同的環境，但這樣做會導致代碼重複和維護性下降。


## 問題


- 配置管理困難：在多個檔案和環境變數中進行配置讓人頭疼。

- 代碼重複：不同環境的`main.dart`常常只是少數幾行不同，但需要維護多個檔案。

- 可維護性：隨著專案規模的增長，這些問題只會變得更加嚴重。


## Flutter Flavor 解決了什麼問題


Flutter Flavor 提供了一個更為統一和標準化的方式來管理不同環境的配置。它允許你在一個單一的代碼庫中容易地切換不同的環境設定，而無需更改代碼。


### 與其他解法的差別


- 統一的管理方式：所有的配置都在一個地方，容易維護。

- 高度可定制：你可以根據不同的需求自由地添加或修改 Flavor。

- 簡單的命令行工具：只需一行命令就能切換環境。


## 實際演練


首先我會跟隨 Flutter 官方的教學，在 iOS 新增名為 dev 的 flavor，作為開發者的環境來作為演示。


### iOS 設置


- 選擇 New Scheme，並名為 DEV

```jsx
Scheme: 定義了當你按下 "Build"、"Test"、"Profile" 等按鈕時會發生什麼。

```


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363keJZomxb7e.png)


- 新增 Configuration，把 `Debug`, `Release`, `Profile` 都複製一遍，並且加上我們 Scheme 的名稱作為後綴，如 `Debug` → `Debug-dev`


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363MHR5jl0ufc.png)


- 選擇 Manage Scheme，並雙擊 dev 打開控制面板，把每個項目的 `Build Configuration`，切換到 dev，如下圖二所示 Release → Release-dev。


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363qz1Lb7AJ8Y.png)


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363WGoH4pHppd.png)


- 到此為止我們已經完成 iOS Flavor 的相關設定，接下來為了印證設定正確，可以來改看看 App 的 Product name。

首先到 Build Setting 更改每個環境你的 App 名稱

- 再到 Info.plist 去修改 `Bundle display name`變成 `$(PRODUCT_NAME)`


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363TyVBO9NAu6.png)


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363ahssNQelqs.png)


運行 `flutter run --flavor dev`，就可以發現 App name 已經順利被我們更改成功了！


![](https://ithelp.ithome.com.tw/upload/images/20230917/201173630gGITS00XX.png)


- 為了編譯出測試 APP 修改 bundleId 也是不可或缺的。一樣到 `Build Setting`，找到 `PRODUCT_BUNDLE_IDENTIFIER` 改成相應的名稱即可。


![](https://ithelp.ithome.com.tw/upload/images/20230917/20117363OaMxH0Z5yD.png)


## Flutter Flavorizr


從上面的步驟可以看到，為了設定 Flavor 我們必須完成好多步驟。過程中如果不小心出錯，要 Debug 會非常困難耗費時間。好險有開發者社群，我們可以到 [pub.dev](http://pub.dev) 找到  [flutter_flavorizr](https://pub.dev/packages/flutter_flavorizr) 這個庫一次完成所有設定。而且更棒的是他會協助我們產生對應環境的 Icon 分類，減少很多工作處理，絕對是必須大推的套件！


- 安裝 Flavorizr，注意是加在 `dev_dependencies`


```yaml
dev_dependencies:
flutter_flavorizr: ^2.2.1

```


- 新增我們要的設定檔，命名為 `flavorizr.yaml`


```jsx
flavors:
prod:
app:
name: 'App'
android:
applicationId: 'com.example.flutter_day_2_flavor'
ios:
bundleId: 'com.example.flutter_day_2_flavor'
macos:
bundleId: 'com.example.flutter_day_2_flavor'
dev:
app:
name: 'App DEV'
android:
applicationId: 'com.example.flutter_day_2_flavor.dev'
ios:
bundleId: 'com.example.flutter_day_2_flavor.dev'
macos:
bundleId: 'com.example.flutter_day_2_flavor.dev'

```


- 執行 `flutter pub run flutter_flavorizr`，Flavorizr 會幫助你切分設定檔中的 iOS 以及 Android 環境，讓你可以更集中化的管理每個不同的 Flavor 場景。執行完後，我們使用 `flutter run --flavor dev` ，來驗證確認 App 的名稱與 bundle 是否正確。


## 結語


希望透過這次的分享，能讓大家認識到 Flavor 的重要性，以及如何實際上手操作，加入自己的工作流程中。講解完 Flavor 後，明天會繼續帶大家認識如何做 Flutter 的 CI/CD 。這系列的文章會致力於完善 Flutter 的軟體開發流程，和一些我學習的成果分享如果文章對你有幫助或是喜歡這個系列歡迎追蹤互動呦！


### 參考資料


- [Flutter Official Documentation](https://flutter.dev/docs)

- [https://github.com/AngeloAvv/flutter_flavorizr](https://github.com/AngeloAvv/flutter_flavorizr)
