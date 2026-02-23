# Day 25: 不要浪費時間在無聊代碼了，實作自己的模板生成工具，Mason Brick！

- 發布時間：2023-10-10 12:23:40
- 原文連結：<https://ithelp.ithome.com.tw/articles/10337515>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 25 篇

![](https://ithelp.ithome.com.tw/upload/images/20231010/201206871V0WIh1EvR.png)

**Mason** 是什麼？它可以有效的幫我們提升開發效率，避免花費不必要的時間在創建檔案或是無聊的代碼上，根據自己和公司的開發習慣去自定義模板和生成結果，很值得投資的一個工具，很棒的是不局限於 Dart 或是 Flutter，透過 **Mustache** 語法撰寫符合自己需求的模板，真的是非常便利。

在開始之前，先讓大家瀏覽實際的使用過程：  
![Mason](https://i.imgur.com/ec0UMQ0.gif)

接著跟著我往下了解它吧～

------------------------------------------------------------------------

Mason 是一個很便利的模板生成工具，由 Bloc、Mocktail 和 equatable 作者 **Felix Angelov** 開發，一位 Flutter 領域裡很有影響力的開發者，目前在 Shorebird 繼續貢獻著。  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687FLHQH4BPpP.png)

Mason 工具也是一個平台，讓大家能夠撰寫自己的 **brick** 磚塊，磚塊就代表模板代碼，製作完成後將它上傳到 **BrickHub**，也就像 PubDev 一樣，開源公開，讓大家互相地分享與使用磚塊。重點核心就是節省時間，提升開發效率。  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687bO8X1bnppF.png)

- **`Brick`** → 為積木、磚塊，包含已經準備好的檔案跟程式碼，預期的結構與格式，透過執行命令讓它幫我們生成代碼
- **`BrickHub`** → 一個雲端共享平台，可以在上面進行分享，或是尋找其他開發者提供的 Brick 專案，將它們安裝和使用在自己的專案裡

> 文件：https://docs.brickhub.dev/

## 安裝 CLI

所有的操作都需要 Mason CLI，透過 dart 安裝到電腦，並確保版本正常，可運行

``` bash
dart pub global activate mason_cli
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687xdFVucaluy.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687FLE9xlEfqh.png)

## 初始化 Mason

在專案裡載入 Mason 設定，包含 `mason.yaml` 和 `mason-lock.json`。本身跟 `pubspec.yaml` 很像，它們紀錄了專案與 Brick 之間的設定，預設擁有 hello 磚塊，執行後會生成一個 `HELLO.md` 檔案，不需要的話可以將它拿掉。

``` bash
mason init
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/201206874JRDmrNDVa.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687lFsaPHbC2h.png)

## 設置 Brick

### 1. 本地磚塊

本地磚塊通常是自己或團隊使用，可能開發、測試後再將它上傳到 private repo，在 `mason.yaml` 設置相對路徑即可。

``` yaml
good:
    path: ./mason/good
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687OBViFPp98L.png)

### ****2. Git****

載入 **BrickHub** 上公開的磚塊，如果一開始只在自己的 **Gitlab** 或 **Github** 上就跟載入套件的方式相同。以下範例為我製作的 Brick，在平台上都搜尋的到，待會跟大家分享如何實作

``` yaml
clean_architecture_feature_riverpod:
    git:
      url: https://github.com/chyiiiiiiiiiiii/clean_architecture_feature_riverpod
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687o0CI74u5gx.png)

## 下載 Brick

下載目前 `mason.yaml` 裡設置的所有積木，執行 `mason get`，跟 pub get 一樣，設置好需要的磚塊後，將它們載入專案

``` hljs
mason get
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687zFTwnSMySu.png)

## 執行/使用 Brick

跟安裝套件一樣，我們找到了這個積木，是因為它裡面生成的檔案跟程式碼我們需要，可以利用它節省時間。執行 `mason make`  命令來生成檔案

- `o` → 指定檔案的生成目的地

### 1. 一般

``` bash
mason make <brick-name>

// hello
mason make hello
```

![Use Brick](https://i.imgur.com/I5v5gLa.gif)

### 2. 命令參數

如果已經知道 Brick 需要的參數，可以直接在命令上使用

``` bash
mason make hello -name Yii
```

### 3. 載入配置檔案

如果 Brick 需要的參數太多，或是不方便手動輸入的話，可以提前準備好相關的 json 配置檔案。命令後方使用 `-c` 設置檔案

``` json
{
  "name": "Yii"
}
```

``` bash
mason make hello -c config.json
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687BaN9RK4FvU.png)  
![Config](https://i.imgur.com/UtSyzWo.gif)

------------------------------------------------------------------------

## 創建 Brick

根據自己或是公司的專案以及平常的開發習慣製作 Brick，生成日常使用的那些無聊代碼，讓我們效率提高。使用 `mason new` 命令

- `o` → 指定檔案的生成目的地
- `-desc` → 模板描述

``` bash
mason new <name>
```

![Create Brick](https://i.imgur.com/1O1mLUG.gif)

創建積木後會有5個檔案

- `__brick__` → 裡面的資料夾和檔案都是會生成出來的東西
- `brick.yaml` → 積木設定檔，跟 `pubspec.yaml` 一樣，擁有基本的名稱、描述、積木版本、Mason 版本，以及相關可互動參數，建議給個完整且好閱讀的內容

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687tXRMkGSS0c.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687b16Z4fcvFM.png)

### 撰寫生成內容

- 使用 `mustache` 語法撰寫，負責處理模板代碼
- 注意：當有資料夾時裡面不能沒有檔案，否則生成時不會創建資料夾

> mustache： https://mustache.github.io/

針對資料夾和檔案，最簡單的撰寫方式是 `{{arg}}`，而最好的是再指定命名類型，官方文件裡有列出所有樣式，以下列出 Flutter 開發時最常用的幾種

- `camelCase()` → helloWorld
- `pascalCase()` → HelloWorld
- `snakeCase()` → hello_world

> Brick Syntax - <https://docs.brickhub.dev/brick-syntax/#built-in-lambdas>

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687qI7D669Svp.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687ozUdgW2l0B.png)

針對頁面，此範例自定義了元件內容，包含類別名稱，使用了 `pascalCase` 駝峰，而因為使用到 **Riverpod** 框架與 **flutter_hook** 進行開發，所以本身繼承 HookConsumerWidget，這個模板可以成為每個頁面的初始樣式

``` dart
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

class {{feature_name.pascalCase()}}Page extends HookConsumerWidget {
  const {{feature_name.pascalCase()}}Page({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const Placeholder();
  }
}
```

生成出來的檔案內容：  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687eL48oCazPp.png)

也可以根據條件、布林值決定是否要生成對應內容

``` yaml
{{#useGoogleFonts}}
google_fonts: latest
{{/useGoogleFonts}}
```

### 設定參數

最重要的是 `vars` 參數配置，這邊是生成資料夾和檔案時會用到的參數欄位，讓使用者可以輸入

- 第一層為名稱
- `type` → 型別，有字串、整數、布林值、陣列
- `description` → 參數描述
- `default` → 預設內容
- `prompt` → 輸入時的提醒文字

``` yaml
vars:
  feature_name:
    type: string
    description: Name of the folder, files.
    default: new_feature
    prompt: What is the name of feature?
```

## Readme 建議

記得將 Brick 說明補充完整，包含使用方式以及列出模板架構給大家方便參考，通常會有幾種資訊

- ****Installation**** → 安裝命令
- ****Usage**** → 生成命令
- ****Variables**** → 參數說明
- ****Packages**** → 結合的相關套件
- ****Output**** → 目錄與檔案結構

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687WCgomTIHrX.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687X6poL31JzI.png)

## 發布 Brick

### 1. 登入 BrickHub

之前還在早期階段，所以需要向官方申請權限，只能用驗證過的 Email 去註冊會員。申請後大概要等 1 ~ 2 週才會收到通知，這時後就能正常部署 Brick 到雲端平台了。  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687kKJzHYSG2E.png)

註冊完成後，在本地使用 CLI 登入帳戶

``` bash
mason login
```

![](https://ithelp.ithome.com.tw/upload/images/20231010/201206871Oa5SUWABA.png)

### 2. 上傳 BrickHub

在 Brick 專案路徑(根目錄)執行命令，進行 Brick 發布。先確保是否公開，如果只是個人與公司使用的話，放在 Git repo 保管就好了。

``` bash
mason publish
```

![BrickHub](https://i.imgur.com/zHHrqwt.gif)

成功後 Brick 就會在 **BrickHub** 上公開讓大家使用。在這提醒一下，請確保自己的東西沒有人上傳過，而且是正確的，因為發布後就無法下架了，除了避免隨意上傳的問題，也要避免濫用服務。  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687HQllt5QRTx.png)

------------------------------------------------------------------------

## Brick 分享

我自己撰寫的 **clean_architecture_feature_riverpod**，大家可以在 BrickHub 上查看，主要為了解決新增 feature 所需要的目錄與檔案問題，通常會有 data、domain、presentation 三個目錄再加上個別檔案，如果全部手動新增的話會非常的耗時與無聊。此磚塊也結合了 Riverpod 去做開發，有相關需求的朋友們歡迎使用，這個專案在架構上沒有 usecase 與 enitity，所以還是根據需求確定是否適合哦。

> [Brick - **clean_architecture_feature_riverpod**](https://brickhub.dev./bricks/clean_architecture_feature_riverpod/)

![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687FdtvWMamg0.png)

完整的目錄與檔案，這些都是 Brick 生成出來的東西， 使用 `mustache` 寫法完成  
![](https://ithelp.ithome.com.tw/upload/images/20231010/20120687HZfU7UVvSe.png)  
![Share](https://i.imgur.com/ybXAhG3.gif)

其他平台上的好磚塊：

- **very_good_core** → 由 VGV 製作，的 Flutter 專案模板，高品質且完整
- **very_good_flame_game** → 由 VGV 製作，遊戲開發的專用模板
- **model** → Model 資料類模板，包含 **copyWith**、**to/from json**、**equatable** 等常用 API
- ...

------------------------------------------------------------------------

## 結論

Mason 已經出來兩年了，目前一樣由多位主要開發者和社群去維護，持續在改版中。每個工具的出現都是為了解決一些問題，相信 Mason 能夠有效幫助到日常開發，看就大家如何去使用它，也很建議想幫助社群的朋友可以多看看開源專案，試著去幫忙盡一點心力。

幫自己或者公司撰寫模板是很棒的一個出發點，能有效減少開發的時間成本，有新的專案也不需要再擔心了，不管是初始專案、UI 元件庫、環境設定、CICD，全部都能模板話，直接輸入幾行指令，馬上完成工作，除了幫助自己之外也能分享給社群。身為工程師，應該學會高效偷懶才對，如果有發現特別、好用的 Brick 記得跟大家分享，可別自己私吞呀！

## 延伸閱讀

- [Day 24: 善用工具與快捷輔助，提升 Flutter 開發效率！](https://ithelp.ithome.com.tw/articles/10336971)

## 相關資源

- <https://docs.brickhub.dev/>
- <https://brickhub.dev/>
- <https://github.com/felangel/mason/tree/master>
- <https://www.youtube.com/watch?v=o8B1EfcUisw&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=qjA0JFiPMnQ&ab_channel=Flutter>
