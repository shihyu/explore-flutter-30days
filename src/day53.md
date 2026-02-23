# Day 53：發佈你的第一個 Package

> 原文來源：[Day 23：發佈你的第一個 Package](https://ithelp.ithome.com.tw/articles/10336610)

嗨嗨！大家好，今天是第 23 天國慶假日呀，沒有放假繼續鐵下去。今天我們要一同探討一件對於每個 Flutter 開發者來說都挺好玩的事：怎麼發佈自己的 Package！嗯，沒錯，就是那些你在 **`pubspec.yaml`** 裡面不斷添加依賴的小工具。


如果你曾經想過：“我也想創造一些酷炫的工具，分享給大家！” 那你就來對地方了。不管是為了改進開發效率，或是單純為了好玩，發佈自己的 Flutter Package 絕對是一次超級有趣的體驗。趕快跟我一起搞懂這個過程吧！


## Flutter 的 Package 類型


在你要開發 Package 之前，首先要搞懂 Package 的類型，在 Flutter Pakcage 我們可以簡單分成三種類型，下面是各個類型的簡單介紹，我們今天要進行示範的會是第一種：


### 選擇 Package 類型


**1. Dart packages:**


- **說明**：這些是通用的 Dart packages，例如 path package。部分可能包含特定於 Flutter 的功能，因此只能在 Flutter 中使用，例如 fluro package。

- **特點**：

使用純 Dart 語言編寫。

- 可能依賴於 Flutter 框架。


**2. Plugin packages:**


- **說明**：這是特化的 Dart package，它結合了用 Dart 編寫的 API 和一個或多個平台特定的實現。

- **特點**：

可為 Android（使用 Kotlin 或 Java）、iOS（使用 Swift 或 Objective-C）、web、macOS、Windows、Linux 或其組合撰寫。

- 例如，url_launcher plugin package 是此類型的一個具體例子。


**3. FFI Plugin packages:**


- **說明**：這也是一種特化的 Dart package，但它結合了使用 Dart FFI 的 Dart API 和一個或多個平台特定的實現。

- **特點**：

利用 Dart FFI (Foreign Function Interface) 與原生程式碼進行交互。

- 可以與 Android、iOS、macOS 等平台的原生代碼進行深度整合。


FFI（Foreign Function Interface）是一個機制，允許在一種程式語言中呼叫另一種語言的函數或方法。Dart FFI 主要用於允許 Dart 代碼直接呼叫 C 語言的函數。


### 建立 Package 程式碼


要開始建立第一個 Package 首先我們要先 create 一個專案


```bash
flutter create --template=package $packageName

```


建立完成後打開專案，應該會看到一個以你的 packageName 命名的 .dart 檔案，這個檔案的第一行會是 library $packageName。用來標示 package 的進入點。


接下來你可以直接在這個檔案開發你要製作的 pacakge，不過一般來說，為了更好的管理程式碼，我們會希望把檔案分開來放，如果要達成這個目的有兩個方法：


**Part file**


可以使用 flutter 的 partfile 讓你的程式碼可以不用都放在 `$packageName.dart` 的檔案底下。在主要的檔案加上 `part $otherPackage.dart` ，並在 `$otherPackage.dart` 加上 `part of $packageName`，如此一來就可以分開每個檔案摟！


```bash
library somepackageName;
part 'other_part.dart';

class Calculator {
/// Returns [value] plus 1.
int addOne(int value) => value + 1;
}

```


```bash
part of somepackageName;

class OtherPart {}

```


**Export file**


另一個方法就是用 export，完成其他檔案後，直接在 `$packageName.dart` 加上 `export $other_file.dart`，用法上會更簡單一點：


```bash
library somepackageName;

export 'other_file.dart';

/// A Calculator.
class Calculator {
int addOne(int value) => value + 1;
}

```


### Package 文件完善


在發布之前需要檢查 Package 的資料夾中是否包含：


`pubspec.yaml`、`README.md`、`CHANGELOG.md`、`LICENSE` 這四個文件。


**pubspec.yaml**


```bash
name: 名稱
description: 描述
version: 版本
homepage: 主頁

```


**README.md**


通常用來放置如何使用你的個 package 的相關教學


**CHANGELOG.md**


如果版本有更新的話，可以在這裡描述更新內容


**LICENSE**


你的軟體開源授權的版本，由於有太多種類這裡就單純列一些常見的給大家參考：


- **MIT (MIT License)**

允許使用者自由使用、修改、分發原始碼，並且可以用於商業用途。

- 使用者必須在分發時包含原始的授權聲明。

- 它是一個非常寬鬆的許可證。


- **GNU (GNU General Public License, GPL)**

要求使用者在分發修改後的軟體時，也必須以相同的 GPL 許可證開放源碼。

- 這是一種“傳染性”許可證，有時也被稱為“病毒式”許可證。

- 特別適用於那些希望保護自由軟體自由的項目。


- **GNU  (GNU Lesser General Public License, LGPL)**

較為寬鬆，允許軟體庫被靜態或動態連接到非開源軟體。

- 但如果你修改了 LGPL 的部分，那麼該部分必須開源。


- **Apache 2.0**

允許使用、修改、分發軟體，且不強制開放分發後的源碼。

- 提供專利許可，且不允許使用該軟體的名稱、商標或起源進行推廣。


- **BSD (Berkeley Software Distribution License)**

像 MIT 許可證一樣寬鬆，但要求保存版權聲明和免責聲明。

- 典型的有“2-Clause”和“3-Clause”版本，其中“3-Clause”版本額外禁止使用該軟體的名稱進行推廣。


- **Mozilla Public License 2.0 (MPL 2.0)**

允許混合開放源碼和封閉源碼，但修改的部分必須開源。

- 提供專利許可。


### 發布與檢查


在發布之前，可以通過檢查來確認你即將要發布的文件有沒有缺漏， Flutter 提供指令直接照著跑即可


```bash
flutter packages pub publish --dry-run

```


最後 terminal 會輸出這個畫面，就代表一切順利啦


```bash
Validating package... (1.1s)
Package has 0 warnings.
The server may enforce additional checks.

```


檢查完以後，我們就可以正式發佈摟，指令也很簡單：


```bash
flutter packages pub publish

```


過程中，他會要求你 google login 上傳你的 package，登入之後一切就沒問題摟！


## 結論：


太棒了，我們終於完成了自己的 Flutter Package 發佈之旅！希望這篇文章能夠幫助到開發者們，把你們的好點子變成實際可用的工具，並分享給更多的人。記住，不管大小，每一個貢獻都是對社群的一大助力。未來還有更多關於 Flutter 的知識等著我們去探索，希望我們都能持續學習，共同成長！謝謝大家的閱讀，下次再見！🚀
