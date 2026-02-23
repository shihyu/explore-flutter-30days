# Day 24: 善用工具與快捷輔助，提升 Flutter 開發效率！

- 發布時間：2023-10-09 16:03:36
- 原文連結：<https://ithelp.ithome.com.tw/articles/10336971>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 24 篇

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687Q5lQvkmDYZ.png)

身為工程師，每天長時間的開發、寫程式碼，提升開發效率是必須的，趕快完成任務才能偷懶沒錯吧？我們必須在節省時間的情況下還能達到目的，除了程式碼的撰寫之外，還有開發工具、設定、快捷鍵等等來協助我們，以 VSCode 來說，它給予開發者很大的幫助。

本文希望分享一些設定與快捷技巧，希望大家了解後能慢慢地養成習慣，開發效率自然就會提升，當我們有多餘時間後，這時要寫測試、重構代碼或是技術交流，這些應該都不是問題了～

------------------------------------------------------------------------

## Project

### Dart Code Fix

善用 **Dart CLI** 可以幫忙節省很多時間，尤其是 `fix` 就非常好用，在專案目錄下使用以下兩個指令，快速根據 lint 修正程式碼，消除 Warnings。搭配 Makefile 當然是如虎添翼，簡單完成任務。

- `dart fix --dry-run` → 找出可修正的部分，並顯示對應的 lint rule
- `dart fix --apply` → 修正所有地方

``` makefile
dart fix --dry-run
dart fix --apply
```

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687IEAQL2Jxvy.png)

### MakeFile for Commands

聰明的使用工具來提升效率，是開發者需要重視的一環。尤其在進行 Flutter 開發時，多少都會需要透過指令來幫我們執行任務，例如：清理環境、取得套件、build_runner codegen等等，我想這些操作大家應該都熟悉到不行了吧。但是要用的時候難免會忘記指令或是參數，甚至要花幾秒打完後才能執行，不覺得這些瑣碎的事情應該要有工具幫忙嗎？

Makefile 很適合用來協助我們，節省非常多無趣時間。而且只需要準備好一個屬於自己或團隊的工具包，之後在每個專案都能直接拿來使用。以下提供常用的幾種設定與操作，歡迎自行取用：

``` makefile
## Clean the environment.
clean: 
    @echo "⚡︎Cleaning the project..."

    @rm -rf pubspec.lock
    @rm -rf ios/Podfile.lock
    @rm -rf ios/Pods
    @rm -rf ios/.symlinks
    @rm -rf ios/Flutter/Flutter.framework
    @rm -rf ios/Flutter/Flutter.podspec
    @rm -rf ~/.pub-cache 
    @flutter clean

    @echo "⚡︎Project clean successfully!"

## Get pub packages.
get: 
    @flutter pub get
    @flutter precache --ios
    @cd ios && pod install

## Run app.
run_dev_debug: 
    @flutter run --debug --flavor dev --target ./lib/main_dev.dart || (echo "Error in running dev."; exit 99)

run_dev_profile: 
    @flutter run --profile --flavor dev --target ./lib/main_dev.dart || (echo "Error in running dev."; exit 99)

run_dev_prod: 
    @flutter run --release --flavor dev --target ./lib/main_dev.dart || (echo "Error in running dev."; exit 99)

## Run build_runner and generate files automatically.
build_runner: 
    @dart run build_runner build -d

## Run build_runner and generate files automatically.
build_watch: 
    @dart run build_runner watch -d

## Analyze the code and find issues.
analyze_lint: 
    @dart analyze . || (echo "Error in analyzing, some code need to optimize."; exit 99)

## Analyze the code by custom_lint
analyze_custom:
    @dart run custom_lint

## Format the code.
format: 
    @dart format .

## Fix the code.
fix: 
    @dart fix --dry-run
    @dart fix --apply

## Generate new app icon images.
launcher_icon: 
    @dart run flutter_launcher_icons:main -f flutter_launcher_icons*

# Mason Tool
mason_feature:
    @mason make clean_architecture_feature_riverpod

## fluttergen for asset gen
fluttergen:
    @fluttergen -c pubspec.yaml
```

再專案跟目錄新增 Makefile 檔案，整理需要快捷操作的指令，接著只需在 Terminal 使用 `make <target-name>` 即可執行動作  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687MwvRDTLQql.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687YxTmtqJPdN.png)  
![Makefile](https://i.imgur.com/cTSjUvQ.gif)

### Github **Dependabot for Packages**

如果你是使用 **Dependabot** 託管專案，可以啟用 **Dependabot**，負責檢查依賴的套件有沒有安全性疑慮和風險，主動創建 PR 提醒開發者修復。

1.  在 `.github` 資料夾，新增 **dependabot.yml** 配置檔案
2.  將 **package-ecosystem** 設為 `Pub`
3.  可以額外設置 `interval`，多久檢查一次，例如：daily、weekly  
    ![](https://ithelp.ithome.com.tw/upload/images/20231009/2012068794KrBEJrrF.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687qVkDoCdow2.png)

``` yaml
version: 2
updates:
  - package-ecosystem: "pub"
    directory: "/"
    schedule:
      interval: "daily"
```

當偵測到安全性問題時，會即時發送相關資訊給開發者，可以即時去處理。  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687CZcy2bGgIf.png)

### Ignore Files of Uploading

創建 `.gitattributes` 檔案，標記哪些檔案不需要上傳到雲端儲存。這樣做的目的有幾個：

1.  節省專案體積 → 在 Flutter 開發裡很常透過 Codegen 來生成一些模板代碼，這些檔案的副檔名通常是 **g** 開頭，很容易數量很多，接著就影響到 Repo 大小。當然也可以上傳，實際上會根據團隊需求去設定，好處是 pull 下來的專案不用再跑 build_runner 指令去生成
2.  安全性 → 環境變數、Config 檔，通常裡面有很多機密資料，例如：API Key、Token、Password 等等，上傳到 Repo 相當於直接露出。我們應該在 CI 時取得相關資料，透過安全地雲端儲存服務，或是 `-dart-define` 參數在指令上設置，在建置的階段進行設置

以下範例挑了幾個基本的設定，不清楚的朋友們可以參考就好，不要完全地複製貼上。應該先跟團隊討論，確認有使用到或是有相關檔案，再進行設置。

``` bash
# For model
**/*.g.dart
**/*.freezed.dart

# For router
**/*.gr.dart

# For resource
**/*.gen.dart

# Config
.env
env.g.dart

# Mason
.mason/
mason-lock.json
```

### Ignore Codegen File Checking

跟忽略專案檔案的差別不同，實際上會將檔案上傳，只是不會做 diff 檢測。所以在查看 PR 的時候，`Files changed` 頁面不會有相關檔案需要檢視。

以下範例一樣在 `.gitattributes` 檔案裡面，有需要再進行設置：

``` bash
.chopper.dart -—diff
.freezed.dart -diff
-g.dart -diff
.gen.dart -diff
-gr.dart -—diff
```

## Fast build_runner Codegen

Codegen 工具 `build_runner` 相信大家都使用過了，負責生成乾淨、好維護、穩定且型別安全的程式碼，為我們節省了大量的時間。但是，隨著專案的成長，檔案越來越多，需要生成的工作量就會增加，這個時候就會花費更多時間，這會讓我們在開發時變的畏懼執行 codegen，因為要等待才能繼續工作。

所以我們要避免分析整個專案，尤其是不相關的檔案，需要選擇忽略，這時侯我們可以新增分析設定檔，有需要的話才動作，避免浪費時間。

在專案根目錄下添加 `build.yaml` 檔案，並將每個套件的生成規則制定好，以下的幾種關鍵字：

- options → 各別套件定義的規則
- include → 指定要持續監控的檔案，只處理它們
- exclude → 指定忽略的檔案
- `**/` → 任何目錄階層
- `*.dart` → 任何有 `.dart` 副檔名的檔案，包含子目錄
- `.dart` → 任何有 `.dart` 副檔名的檔案

範例：

``` yaml
targets:
  $default:
    builders:
      json_serializable:
        options:
          include_if_null: false
          explicit_to_json: true
        generate_for:
          include:
            - "**/models/**.dart"
      freezed:
        generate_for:
          include:
            - "**/models/**.dart"
      riverpod_generator:
        generate_for:
          include:
            - "**/providers/**.dart"
            - "**/**_provider.dart"
```

------------------------------------------------------------------------

## VSCode

### Amazing Save Action

針對 VSCode IDE 的儲存操作做一些優化，當我們執行儲存後，同時維持程式碼的高品質

- 打開 **settings.json** 設定 `editor.codeActionsOnSave`
  - `source.fixAll` → 跟 lint 有關的提示、警告，在儲存後自動修正
  - `source.organizeImports` → 針對 import 檔案，自動調整為可讀性高的排列
  - `quickfix.add.required`、`quickfix.add.required.multi`→ 幫命名參數自動補上 **required** 關鍵字
  - `quickfix.create.constructorForFinalFields` → 自動幫 final 屬性創建一個建構子
  - `editor.formatOnSave` → 儲存後自動幫程式碼排版

``` json
"editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true,
    "quickfix.add.required": true,
    "quickfix.add.required.multi": true,
    "quickfix.create.constructorForFinalFields": true
},
"editor.formatOnSave": true,
```

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687ixaPOVTJTf.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687lc97kN04Yx.png)

Dart 官方有持續針對 VSCode 做一些優化，使用 `quickfix` 和 `refactor` 提升開發效率，詳細資訊可以點擊連結查看：[Refactorings and Code Fixes](https://dartcode.org/docs/refactorings-and-code-fixes/)

### Hide Files for Same Scope

本身的開發習慣，不只程式碼可讀性有一定品質外，專案的檔案、目錄也需要照顧。我們可以透過 VSCode Setting 去設定，將一些生成的檔案或是不常用的部分隱藏起來，由單一檔案作為入口去呈現。很簡單的設定，卻能讓開發體驗上更好。

``` json
"explorer.fileNesting.patterns": {
        "pubspec.yaml": "pubspec.lock,pubspec_overrides.yaml,.packages,.flutter-plugins,.flutter-plugins-dependencies,.metadata",
        "*.dart": "${capture}.g.dart, ${capture}.freezed.dart, ${capture}.gr.dart"
    },
"explorer.fileNesting.enabled": true,
"explorer.fileNesting.expand": false,
```

![Hide Files for Same Scope](https://i.imgur.com/KzlUiWz.gif)  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687ZXxfYvxMar.png)

### Hidden Info Appear

Flutter 3.7，支援使用快捷鍵瀏覽型別和參數名稱

1.  Windows → 鍵盤同時點擊 `Ctrl + Alt`
2.  MacOS → 鍵盤同時點擊 `Ctrl + Option`

![Hidden Info Appear](https://i.imgur.com/kG6qjez.gif)

### Class to File

如果 Flutter 已升級至 v3.13，現在可以直接幫指定 Class 生成對應的獨立檔案，使用提示的快捷操作。更好的是生成後，原有的檔案會自動匯入新的 Class 檔案，開發上非常便利。

1.  在類別上方點擊驚嘆號，或是使用 `option + enter`，開啟選單
2.  點擊 `Move ‘XXX’ to file`

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687k3cjjV8q7D.png)  
![Class to File](https://i.imgur.com/MBmJV60.gif)

### Covert parameters to named

使用快捷鍵將參數轉為命名參數

1.  到 VSCode 設定搜尋 Dart，打開 **Experimental** 頁面，開啟 `Experimental Refactors`
2.  在建構子上方點擊驚嘆號，或是使用 `option + enter`，開啟選單
3.  點擊 `Covert all formal parameters to named`

![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687OzGAztTwrG.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231009/2012068771bzWBdHJs.png)  
![Covert parameters to named](https://i.imgur.com/acEVc4v.gif)

### Snippet for Generating Template

透過提示生成無聊的樣板代碼，只需要幾秒即可完成數十行，例如：每個頁面的初始樣子，都是會使用 Stateless 或 StatefulWidget，其中 `build()` 的初始元件就是 Material、Scaffold，這些我們都可以不用花時間去撰寫，使用快捷提示節省時間。

使用第三方網頁工具，例如 **vscodesnippetgenerator**，將每次都會出現的程式碼貼到 Body 區塊，請它幫我們生成 VSCode Snippet，可以設置 Snippet 名稱與命令。  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687uohNAgeD1M.png)

使用另一個工具 **snippet generator** 協助我們。  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687SCxiNXIFtu.png)

接著點擊 **Configure User Snippets** 選項，打開 `dart.json` 設定檔，將我們生成的 Snippet 貼上就完成了  
![](https://ithelp.ithome.com.tw/upload/images/20231009/201206876lvnVHOw7n.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231009/201206876BCplu4ryt.png)

以下是範例，一個簡單的頁面初始程式碼  
![](https://ithelp.ithome.com.tw/upload/images/20231009/201206872D5Dpra41O.png)

結合實際開發場景，只要輸入自定義的命令就能生成準備好的程式碼，有效提升開發效率。  
![Snippet](https://i.imgur.com/KEDLfj0.gif)

> 另外，我們也有其他方式能一次生成目錄結構以及檔案，可以使用 **Mason** 來協助我們，詳細請到另一篇文章 (等待發布)

------------------------------------------------------------------------

## Dart

### If-Case Matching for Checking Nullable

從 Dart 3 開始，在檢查 nullable value 時，可以直接使用 `If-Case Matching`，只要符合型別、型態就會繼續後面的操作，寫法非常簡潔、好用。

``` dart
int? age;

void main() {
    // Old
    if (age != null) {
      printAge(age ?? 0);
        printAge(age!);
    }
    
    // New 1
    if (age case final int age) {
      printAge(age);
    }
    
    // New 2
    if (age case final age?) {
        printAge(age);
    }
}

---

void printAge(int age) {
    print('Age is $age.');
}
```

### Records and Future extension

Dart 3 新增了幾個新的 async api，包含 **FutureRecord2** ~ **FutureRecord9**，針對參數多寡去使用。主要讓我們可以使用 Record 執行 `wait()` 擴充方法，等待所有非同步任務執行完成，回傳值就是 Record 結果。並且多了 **ParallelWaitError** 類別，可以使用 try catch 捕捉，其中 error 當中有兩個屬性，一個是 values (valueOrNull)，代表成功回傳值 Record 清單，一個是 errors (errorOrNull) 失敗錯誤 Record 清單。兩個清單都非同步結果可能有值也可能因為錯誤而是 null，就需要自行判斷檢查了。  
![](https://ithelp.ithome.com.tw/upload/images/20231009/20120687aAJSSsHJfq.png)

``` dart
// Old
final result = await Future.wait([getName(), getAge()]); // return List<Object>

// New: Use FutureRecord2 extension
try {
    final (name, age) = await (getName(), getAge()).wait;
    print('$name is $age years old.');
} on ParallelWaitError catch (error, stackTrace) {
    print(error.values); // ('Dash', null)
    print(error.errors); // (null, asyncError)
}

---

Future<String> getName() async {
  return 'Dash';
}

Future<int> getAge() async {
  return 18;
}
```

提醒：雖然是錯誤 ParallelWaitError 有 Parallel 關鍵字，但它還是在相同 Isolate 處理多個非同步任務。

> - <https://api.flutter.dev/flutter/dart-async/dart-async-library.html>
> - <https://api.flutter.dev/flutter/dart-async/FutureRecord2.html>
> - <https://api.flutter.dev/flutter/dart-async/ParallelWaitError-class.html>

------------------------------------------------------------------------

## 總結

本文整理了一些專案與 VSCode 的開發經驗，之後會再分享續集。其實相關技巧與方式很多，如何讓自己  
開發順暢、有好的感受比較重要，重點是養成習慣，融入日常開發，使用對的方式去工作，相信效率自然就會提升。而後面順便補充了 Dart 在 v3 新版的開發觀念，它們很常遇到也很重要。

鐵人賽系列除了知識、觀念與源碼解析之外，也希望能讓大家注意到開發環節的每一部份，懂得讓它們發揮最大價值。而 Flutter 之後也會分享相關的開發技巧，可以期待與關注，休息一下吧，我們下一篇見！

## 延伸閱讀

- [Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！](https://ithelp.ithome.com.tw/articles/10319282)
- [Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！](https://ithelp.ithome.com.tw/articles/10320379)
