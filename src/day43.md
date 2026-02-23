# Day 43：嗚呼！提升 Flutter 安全性的七種方法｜Flutter Security

> 原文來源：[Day 13：嗚呼！提升 Flutter 安全性的七種方法｜Flutter Security](https://ithelp.ithome.com.tw/articles/10330187)

經過昨天的 shader 洗禮，感覺好像要越走越偏們，今天趕快把道路拐回來，介紹一下 Flutter 的安全性。在資安上有一個經典的「水桶理論」，這個桶子由許多木板組成，代表不同的安全措施和策略，例如防火牆、密碼策略、員工培訓等。儘管大部分木板可能很高、堅固，但如果其中一塊木板很短或有裂縫，水（或數據）就會從那裡溢出。因此，盡可能的去提升每個地方的短板，對於資安來說十分重要，所以接下來我們會盡可能的介紹每一種安全策略。


### 1. Use code obfuscation


代碼混淆是一種將您的代碼變得難以讀取和理解的方法，使得惡意用戶無法直接閱讀。但要注意的是，這裡做的只有混淆而不會對內容做加密，所以並不能完全依賴他。


目前大多數的平台都支援 **obfuscation**，除了 web 並沒有直接支援，但是 web app 的 release 版本會支援 **Minification**，其實也是大同小異，所以不用太過擔心。


實作的方法也很簡單，只需要再 build 後面加上 `--obfuscate`


```dart
flutter build apk --obfuscate --split-debug-info=/
/

```

如果我們只下 flutter build apk --obfuscate  會得到一個警告


obfuscate can only be used in combination with  “— split-debug-info”


這是因為當Android發生崩潰或ANR時，會生成一個 stackTrace，他紀錄了到崩潰時為止程式中被調用的函數序列。這個追踪會顯示類名和相關的行號，幫助我們找到崩潰的原因。但這需要將生成此堆疊追踪所需的所有信息都包括在app中，這會增加app的大小。


使用**`--split-debug-info`**選項，他會刪除在 app 裡面打包的還原數據，把他另外放在指定的資料夾，這會大大減少應用程式的大小。


因為我們的程式碼經過混肴，所以可能在某些 debug 或是 log 工具可能需要可以把混肴過的程式碼再還原回來。這時候就需要加上 `--save-obfuscation-map`


### 2. Background snapshots protection


當用戶將應用放到後台時，系統會生成一個 snapshot。這可能會洩露用戶的敏感信息。確保在這些快照中不顯示敏感内容是很重要的。現在大部分的銀行 App 都支援這個功能，避免你在做螢幕錄影或是意外的情況下截圖。


我們可以透過 [screen_protector](https://pub.dev/packages/screen_protector) 這個包來解決這個問題，他可以幫我們生成一個畫面阻擋切換畫面時會意外洩漏的問題。


```dart
class _PreventScreenshotPageState extends State {

@override
void initState() async {
await ScreenProtector.preventScreenshotOn();
super.initState();
}

@override
void dispose() async {
await ScreenProtector.preventScreenshotOff();
super.dispose();
}

}

```


screen protector 不只提供切換 app 時的保護，他同時也包含 screen snapshot 和 screen  record 的監聽，可以讓我們對用戶做出更多合適的提示！


這個 package 目前有被回報在 iOS 17 上面會失效，如果近期要使用的的人可能要跟進這個 [issue](https://github.com/prongbang/screen_protector/issues/22) 哦


### 3. 只使用 debugPrint 而不是 print


現在如果你用 vscode 進行開發，flutter 的 lint 就會提醒你應該要使用 `debugPrint` 代替 `print`。`debugPrint`  在 release 的環境下，不會打印到用戶手機的 log 裡面，可以大大避免我們平時開發用的 print  變成壞壞黑客們可以順藤摸瓜的工具。


```dart
// do not
print(SomeThing);

// do
debugPrint(SomeThing);

```


### 4. override toString


想像你的程式碼裡面，不小心被觸發了一個 Bug，你的第三方後台自動搜集了這個錯誤，並且把當下的錯誤 log 放到監控日誌中。乍看之下沒什麼大問題，但你忘記其實在 `userData` 裡面其實有保存用戶的機密資料 `sensitiveData`，在你不知情的情況下把 `userData` 的實作打印到監控後台中。


即便我們已經盡可能使用 `DebugPrint` 不讓這些測試的內容打印到 release 的環境，但是仍舊可能會發生意外情況。這時候我們還可以採取最終手段，直接 override toString 的方法，避免你在意外的情況印出這些機密資料或是 `UserData` 的實作可能不小心被 log 的情況。


```dart
class UserData {
final String sensitiveData;
final String notSensitiveData;
@override
String toString() {
return 'Data{notSensitiveData: $notSensitiveData, sensitiveData:"-"}';
}
}

```


### 5. Use Flutter jailbreak detection


由時候風險不是來自你的程式碼，而是用戶自己開啟的。例如：用戶的手機已經越獄或 Root 就可能會對你的 app 造成風險，必要時必須禁止這些用戶操作你的 app 或者設置免責提醒。


可以使用 [flutter_jailbreak_detection](https://pub.dev/packages/flutter_jailbreak_detection) 這個 package 來幫助我們達到這個目的。


用法十分簡單，如果你的 App 會包含敏感資料，記得用這個來保護自己也保護用戶哦～


```dart
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';

bool jailbroken = await FlutterJailbreakDetection.jailbroken;
bool developerMode = await FlutterJailbreakDetection.developerMode; // android only.

```


### 6. Github code owner


除了外部安全因素，有些安全性問題反而是出現在內部，如果程式碼的 code base 越來越大，可能每個人對每段程式碼的熟悉度不同，有些安全性或者有哪些邏輯可能只有特定人比較熟悉，如果其他人對這個檔案要作出改動的話，我們會希望要有這些對程式碼或邏輯更理解的人來幫忙審閱。GitHub 就提供了這個方便的工具叫做 `CODEOWNERS`。在根目錄創造 `.github` 的資料夾，新增檔案，名稱為： `CODEOWNERS` 。


檔案的格式很簡單，就是 filePath 空格 github use name，這樣就完成設定了，設定完成以後，如果你的 PR 有修改到這個檔案，就必須經過被指名的 github user 同意，這個 PR 才能合進去。


```dart
/path_to_file/ @userName

```


在 GitHub 的檔案上面，你就會看到一個小小的藍色盾牌。表示這個檔案已經受到保護摟～


![](images/20117363HSfvTi87wd.png)


### 7. fork 重要 package 避免對方的 repo 已經被 hack


有時候攻擊不是來自內部，而是你依賴的第三方庫。可能你拿來做生成加密的第三方庫，被其他壞壞份子駭入，在你不知情的情況下，他們偷偷更新你依賴的第三方庫，並在裡面加入壞壞的後門或漏洞，這有可能會讓你的 App 暴露在風險之下，因此如果你有某些機密資料或加密方法依賴於第三方的庫，都建議要把這些庫的版本做鎖定，或是 Fork 到自己能控制的 repo 底下，避免意外的漏洞！


## 結論：


經過詳細的探討，資安的措施是十分豐富且多元的。從代碼混淆、背景快照保護、日誌輸出保護，到偵測越獄裝置、內部程式碼審查以及外部依賴管理，每一項策略都體現了一份對用戶資料和應用程式的守護心意。


安全不僅僅是技術上的追求，更是對用戶的一份承諾。正如「水桶理論」所說，只要一塊木板有裂縫，整個桶的水都可能會溢出。因此，開發者需要全方位地強化每一塊“木板”，確保應用的資安無處不在，無縫不留。而這其中的策略和方法，就如同我們今天所探討的一樣，都值得我們深入學習和應用。


Flutter 的安全性實踐不應只是一次性的工作，而應是一個持續、循環的過程。只有時時刻刻保持警覺，不斷地學習和優化，我們才能確保為用戶提供一個既美觀又安全的應用體驗。
