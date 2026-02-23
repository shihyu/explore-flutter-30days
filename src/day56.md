# Day 56：Flutter Monorepo 探索之旅｜如何在大型項目中保持高效？Melos 告訴你

> 原文來源：[Day 26：Flutter Monorepo 探索之旅｜如何在大型項目中保持高效？Melos 告訴你](https://ithelp.ithome.com.tw/articles/10338416)

今天要來談談大型的 Flutter 項目會遇到的問題，當一個公司或團隊的技術慢慢堆疊，隨著時間的推移，可能會開發出多款不同的 App，或者一個大型的 App 會被分解成多個模組或子項目。這時就必須要會面對以下的困難：


- **版本一致性**：當多個 App 或模組需要使用相同的 package 或工具時，確保他們使用相同的版本會是一個挑戰。當一個 App 更新了某個函式庫的版本，可能會對其他 App 產生影響。

- **程式碼重複**：多個 App 或模組中可能存在共同的功能或組件。這會導致重複編寫或維護相同的程式碼，增加開發和維護的工作量。

- **協作困難**：當多個開發者或團隊在不同的存儲庫中工作時，合併更改、解決合併衝突或同步更新都可能會更複雜。

- **集成和測試的挑戰**：對於跨 repo 的功能更改或更新，執行完整的集成測試可能會更困難，因為需要同時取得所有相關的 repo。


這些可能都會讓開發的速度降低，必須花更多時間處理瑣碎的事情，所以這時候 Monorepo 就出現了。


### 什麼是Monorepo?


Monorepo，也稱為單一倉庫策略，是指在一個版本控制系統中，所有的程式碼和項目都存放在同一個 repository 中。這意味著不同的項目、函式庫、工具和服務都共用一個版本控制系統的存儲庫。


舉個簡單的例子，假設一家公司有五個不同的專案，傳統的方式是為每個專案創建一個獨立的倉庫。但在 Monorepo 策略中，這五個專案都會存放在同一個倉庫中。


**Monorepo 的優勢**


- **統一的版本管理**：當所有程式碼都在同一個 repo 時，您可以很容易地跟踪和管理所有依賴和庫的版本。

- **簡化的協作**：由於所有程式碼都在同一個地方，開發人員不需要在多個 package 之間切換，這使得跨專案協作更加容易。

- **統一的建置和測試流程**：可以確保所有的項目和程式碼都遵循相同的建置和測試流程，這有助於提高軟件的質量。


在 Flutter 中，如果我們想要開始引入 Monorepo ，已經有很多大型專案開始使用這個套件：Melos，下面我們就來介紹一下 Melos 吧！


採用 Melos 的專案


- **[firebase/flutterfire](https://github.com/firebase/flutterfire)**

- **[Flame-Engine/Flame](https://github.com/flame-engine/flame)**

- **[aws-amplify/amplify-flutter](https://github.com/aws-amplify/amplify-flutter)**

- **[fluttercommunity/plus_plugins](https://github.com/fluttercommunity/plus_plugins)**

- **[GetStream/stream-chat-flutter](https://github.com/GetStream/stream-chat-flutter)**

- **[4itworks/opensource_qwkin_dart](https://github.com/4itworks/opensource_qwkin_dart)**

- **[gql-dart/ferry](https://github.com/gql-dart/ferry)**

- **[cbl-dart/cbl-dart](https://github.com/cbl-dart/cbl-dart)**


### 什麼是 Melos


以下是翻譯自官網的介紹：


將大型 Code base 分割成獨立的 pacakge 對於程式碼公用是非常好的方法。然而，在多個 repo 之間進行更改是混亂的，且難以追踪，而且跨存儲庫的測試變得複雜。Melos 通過允許多個 package 在一個 repo 內共同工作，同時彼此完全獨立，來幫助解決這些問題。


簡單來說，如果我們想要開始使用 Monorepo 整理我們的專案，必須自己去管理如何同步每個 package 之間互相依賴的問題，要整合測試流程，這些如果沒有 Melos 的幫助都要自己寫 Script 來完成。


那 Melos 到底如何使用呢？


全域安裝 Melos


```dart
dart pub global activate melos

```


先建立一個空的資料夾，並且放入 pubspec.yaml 的檔案


```dart
name: my_project_workspace

environment:
sdk: '>=2.18.0 =3.1.2 <4.0.0'
dependencies:
flutter:
sdk: flutter
cupertino_icons: ^1.0.2
digital_art_toolkit: ^0.0.1

```


生成的 `pubspec_overrides`


```bash
# pubspec_overrides.yaml
# melos_managed_dependency_overrides: digital_art_toolkit
dependency_overrides:
digital_art_toolkit:
path: ../digital_art_toolkit

```


**Melos Clean**
除了 `melos bootstrap`，melos 也有一個對應的 `flutter clean` 的功能，可以做到一樣的效果：


```bash
melos clean --flutter

```


甚至如果你有 clean 完要跟著做什麼行為，可以用 hook 來幫你解決，到 melos.yaml 檔案下設定：


```bash
# melos.yaml
...
command:
clean:
hooks:
post: rm packages/foo/lib/src/generated_file.g.dart
...

```


### Melos Script


在 Monorepo 的使用情境下，很常會有自動化的部分需要靠自己跑 script 來解決，melos 也提供跑 shell script 的方法，使用的情境可以分成兩種


**Run script**：在 run script 的情境下，我們可以自己命名這個 script 然後設定他要 run 哪些 shell 指令即可，甚至可以自己寫環境變數：


```bash
# melos.yaml
...
scripts:
hello:
env:
GREETING: 'Hey'
goodbye: 'See ya'
run: echo "$GREETING"
...

```


```bash
# run script
$ melos hello

# print
'Hey'

```


**Run exec**：針對所有 package 都會跑一遍，所以如果你有 12 個專案，那他就會跑 12 次：


```bash
# melos.yaml
...
scripts:
hello-exec:
exec: echo 'Hello $(dirname $PWD)'
...

```


```bash
# run exec
$ melos hello-exec

# print
[digital_art_toolkit]: Hello /Users/dora
[flutter_day_10_build_runner]: Hello /Users/dora
[flutter_day_10_shader]: Hello /Users/dora
[flutter_day_14_hot_reload]: Hello /Users/dora
[flutter_day_14_secure_storage]: Hello /Users/dora
[flutter_day_15_performance]: Hello /Users/dora
[flutter_day_21_tester]: Hello /Users/dora
[flutter_day_23_storybook]: Hello /Users/dora
[flutter_day_25_zone]: Hello /Users/dora
[flutter_day_2_flavor]: Hello /Users/dora
[flutter_day_6_sentry]: Hello /Users/dora

```


這兩種指令可以分別對應整體跟每個 package 的情況，可以更自動化所有的流程！


### Melos Vscode Plugin


如果你正在使用 Vscode 也可以考慮使用 melos 的 [plugin](https://marketplace.visualstudio.com/items?itemName=blaugold.melos-code)，他有更快的指令還有一個畫出依賴圖的功能，有興趣可以裝來玩玩看，可以更視覺化的找出是否有不當的依賴哦：
![](https://ithelp.ithome.com.tw/upload/images/20231011/20117363uFMFb57qlS.png)


![](https://ithelp.ithome.com.tw/upload/images/20231011/2011736382tpjnMQ64.png)


### Melos 的問題與挑戰


melos 的功能介紹的差不多了，但是目前使用上有遇到兩個小小的問題，可能還需要未來的版本解決：


- **存儲庫的大小**：隨著時間的推移，Monorepo可能會變得非常龐大，這可能會導致某些版本控制工具（如Git）在性能上受到影響。Melos 目前還沒有部分 clone 程式碼的功能。

- **權限和安全性**：在單一倉庫中管理所有程式碼可能需要更複雜的權限模型，以確保只有合適的人員可以訪問特定的程式碼。


### 結論


在大型項目的發展與管理上，Monorepo 策略無疑提供了一個革命性的解決方案。它不僅促使版本的統一管理，減少了程式碼的重複，也使得跨專案的協作更為簡單和順暢。Melos，作為 Flutter 中的一個重要工具，進一步簡化了 Monorepo 的實施過程，使得開發者能夠更專注於功能開發，而不是持續地處理版本和協作的問題。


但正如我們所提及的，Monorepo 和 Melos 雖然帶來了很多便利，但仍有其局限性和挑戰。對於存儲庫的大小，我們需要注意隨著時間的推移，如何維持其效能；對於權限管理，我們需要建立更為完善的策略以確保代碼的安全性。這些都是在實際使用過程中需要持續觀察和優化的部分。


總的來說，Monorepo 策略及 Melos 的引入，對於 Flutter 的大型項目開發，確實帶來了巨大的助益。但如同任何技術選擇，開發者在選用之前都需要根據項目的具體需求進行詳細的評估。只有真正理解其優勢與挑戰，才能充分發揮其效用，並使得項目發展更加順利。希望這篇探索之旅，能為各位在 Flutter 的大型項目開發上提供一些有益的參考和啟示。
