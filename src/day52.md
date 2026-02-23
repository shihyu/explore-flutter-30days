# Day 52：來聊聊測試這件事（下）｜Golden Test 黃金傳說

> 原文來源：[Day 22：來聊聊測試這件事（下）｜Golden Test 黃金傳說](https://ithelp.ithome.com.tw/articles/10336162)

回顧過去的兩篇文章，我們從Flutter的TDD策略進行了深入的探討，到工具包的選擇和使用。Flutter, 作為當前最受歡迎的移動應用開發框架，對於測試有著極高的要求，尤其是當我們想要確保App的表現和交互效果能夠達到最佳。這時，Golden Test這一策略悄然崭露頭角。


在Flutter中，Golden Test指的是對App的UI進行的快照測試。它將當前的Widget渲染成一個像素圖像，然後將此圖像與基準圖像（即"黃金圖像"）進行比較。這種測試確保了即使在經過多次迭代和修改後，App的UI仍然保持一致性。


但Golden Test在Flutter的應用並不止於此。當然，確保UI的一致性只是表面，真正的奧秘和價值在於其如何幫助開發者快速發現和修正問題，優化用戶體驗。今天，我們將繼續深入探索Flutter中的Golden Test，了解它在移動應用測試中的真正威力，並分享如何有效地利用這一策略提升App品質。


今天我們就一起來看看幾款關於 Flutter Golden Test 的工具吧！


## Maestro


我們首先要來看的是老牌工具 Maestro，他在今天要介紹的工具裡面屬於比較特別的一款，
他是直接透過 yaml 檔去控制模擬器要如何操作整個 App。對於測試工程師相對友善，因為你不需要去理解程式碼背後的意義，只要控制模擬器的點擊跟操作即可。


歸納下來有幾個優點：


- E2E 測試框架，跨 App 操作：假設你 App 有第三方登入功能，你需要模擬器先登入 twitter，Maestro 只要知道 appId 就可以幫你完成這件事，透過不同的 flow 幫你先完成登入其他 App 的功能。推薦一個網站：https://offcornerdev.com/bundleid.html 可以幫你查詢主流 app 的 bundle id。

- yaml 相對簡單：無需知道 dart 該怎麼寫，只要學習 yaml 定義好的語法。

- 支援錄影截圖，幫你還原錯誤發生時的狀況


可以直接看官方的錄影截圖直觀感受一下：


![](https://user-images.githubusercontent.com/847683/187275009-ddbdf963-ce1d-4e07-ac08-b10f145e8894.gif)


如果對 Maestro 該如何使用有興趣的小夥伴，可以參考 Yii 寫的文章，有很詳細的介紹。這裡就不重造輪子，直接參考他的文章吧。


[Maestro 介紹](https://medium.com/flutter-formosa/%E4%BD%A0%E7%9F%A5%E9%81%93-maestro-%E5%97%8E-%E7%9A%86%E5%85%B7%E4%BA%BA%E6%80%A7%E7%9A%84%E8%87%AA%E5%8B%95%E5%8C%96%E6%B8%AC%E8%A9%A6%E6%A1%86%E6%9E%B6-flutter-%E5%93%81%E8%B3%AA%E5%B0%B1%E9%9D%A0%E5%AE%83%E4%BA%86-part-1-%E4%BB%8B%E7%B4%B9%E8%88%87%E4%BD%BF%E7%94%A8-f9125fe62932)


### Golden Toolkit 和 Alchemist


接下來介紹這兩個重量級工具，都是由知名的公司所開發， Golden Toolkit 是 ebay 所支持。而 Alchemist 則是由  [Very Good Ventures](https://verygood.ventures/) 🦄  和  [Betterment](https://betterment.com/) ☀️ 聯合開發。這裡必需特別提到 Very Good Ventures 是少數的 Flutter consulting 公司，對 Flutter 社群有很多貢獻，如果你有興趣可以到他們 [X 帳號](https://twitter.com/VGVentures)看看，會有不少好玩有趣的新知識。


話題繼續拉回來 Golden Toolkit 和 Alchemist 這兩個工具，他們基本上的用法差不多， Alchemist 也在 [README.md](http://README.md) 寫到，他們的產品深受 Golden Toolkit 的啟發。所以我就不重新介紹兩次，一起來看看 Alchemist 怎麼使用吧！


**Step 1：** 安裝依賴


```dart
alchemist: ^0.7.0

```


**Step 2：** 寫一個要測試的 Widget，並把它放在 `goldenTest` 中，每種要測試的情形都可以包在 `GoldenTestScenario` 中：


```dart
import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
group('ListTile Golden Tests', () {
goldenTest(
'renders correctly',
fileName: 'list_tile',
builder: () => GoldenTestGroup(
scenarioConstraints: const BoxConstraints(maxWidth: 600),
children: [
GoldenTestScenario(
name: 'with title',
child: const ListTile(
title: Text('ListTile.title'),
),
),
GoldenTestScenario(
name: 'with title and subtitle',
child: const ListTile(
title: Text('ListTile.title'),
subtitle: Text('ListTile.subtitle'),
),
),
GoldenTestScenario(
name: 'with trailing icon',
child: const ListTile(
title: Text('ListTile.title'),
trailing: Icon(Icons.chevron_right_rounded),
),
),
],
),
);
});
}

```


**Step 3：** 完成 Widget Test 的撰寫後，我們接下來就要跑 update-goldens，這個步驟會幫我們生成對應的 golden test 的 widget 截圖：


```dart
flutter test --update-goldens

```


你會發現有兩種截圖的樣式，分別是  **CI tests 和 platform tests** ，被塗黑黑的這種是 CI test 保留原本文字的是 platform test，之所以會分成兩種是因為如果是在你本地跑 golden test 文字就不會受到系統的影響而有所改變，但跑在 CI 機器上的話，可能會有系統預設字體等等的問題，導致你的 widget 測試與原本的不同，但是因為字體而讓測試失敗並不是我們想要的。所以這個貼心的功能就是把文字都用黑色遮起來，讓 CI 是哪種裝置上，都可以通過。


![](https://ithelp.ithome.com.tw/upload/images/20231007/2011736354hKK1MtcG.png)


![](https://ithelp.ithome.com.tw/upload/images/20231007/20117363oyBDYJogPF.png)


**Step 4：** 在我們完成 `--update-goldens` 之後，生成了正確的 Widget 截圖，接下來就是要驗證在其他 CI 流程上，這些 Widget 都沒有被破壞是正確的。這裡只要按照 flutter test 下去跑就可以，如果只跑 golden test，Alchemist 也有提供相應的指令：


```bash
# Run all tests.
flutter test

# Only run golden tests.
flutter test --tags golden

# Run all tests except golden tests.
flutter test --exclude-tags golden

```


到這裡我們就完成 Golden Test 的基本操作摟。接下來提供幾個 Alchemist 的進階用法給大家參考


Alchemist config 設定：


可以透過 `AlchemistConfig.runWithConfig` 去做一些基礎設定，如 themeData，或是 obsecure Text 等等。


```bash
void main() {
print(AlchemistConfig.current().forceUpdateGoldenFiles);
// > false

AlchemistConfig.runWithConfig(
config: AlchemistConfig(
forceUpdateGoldenFiles: true,
),
run: () {
print(AlchemistConfig.current().forceUpdateGoldenFiles);
// > true
},
);
}

```


不過如果你想一次設定所有 test file 的 AlchemistConfig 可以用一個 Flutter 的測試功能flutter_test_config.dart，這個 config 設定檔會在跑每個 _test.dart 的檔案前都跑過一次，如果我們有需要設定給所有測試檔案的功能都可以透過他實現。


💡 這個功能並不只限制於 Alchemist 而是 Flutter 本身自帶的哦


```bash
// flutter_test_config.dart

import 'dart:async';

import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';

Future testExecutable(FutureOr Function() testMain) async {
// ignore: do_not_use_environment
const isRunningInCi = bool.fromEnvironment('CI', defaultValue: false);
debugPrint('======run test=========');
return AlchemistConfig.runWithConfig(
config: AlchemistConfig(
theme: ThemeData.dark(),
platformGoldensConfig: const PlatformGoldensConfig(
enabled: !isRunningInCi,
),
),
run: testMain,
);
}

```


手勢模擬：假設你的按鈕被觸碰後會有不一樣的顏色，你希望確認這些顏色都是正確的，可以用透過 `whilePerforming`，在截圖的當下模擬情境，這裡的 press 就是模擬被觸碰後的按鈕：


```bash
void main() {
goldenTest(
'ElevatedButton renders tap indicator when pressed',
fileName: 'elevated_button_pressed',
whilePerforming: press(find.byType(ElevatedButton)),
builder: () => GoldenTestGroup(
children: [
GoldenTestScenario(
name: 'pressed',
child: ElevatedButton(
onPressed: () {},
child: Text('Pressed'),
),
),
],
),
);
}

```


## 總結


在 Mobile 的開發環境中，Golden Test 的策略已經不只是測試界的傳說，而是每一位 Flutter 工程師需要學習的技能。從Maestro的直觀操作，到 Golden Toolkit 和 Alchemist 的專業深度，無論你是剛開始探索Flutter的新手還是資深的 senior，這些工具都為你提供了一條路徑，確保 App 的品質在迅速變動的市場中始終保持領先。總之，這不僅僅是一個技術故事，更是一場技術冒險，等著每一位Flutter工程師去體驗和探索！🚀👩‍💻👨‍💻
