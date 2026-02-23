# Day 40：燚！揭秘 Source Gen｜Flutter 代碼生成

> 原文來源：[Day 10：燚！揭秘 Source Gen｜Flutter 代碼生成](https://ithelp.ithome.com.tw/articles/10328283)

在上一篇文章中，我們深入探索了 Flutter 中的 Metadata，介紹了許多有趣的 Annotation。當然，光是了解 Metadata 只是冰山一角，今天我們要繼續深挖，帶大家認識 Flutter 中另一個強大的工具—— `source_gen`。


## 引言:


哈囉！各位 Flutter 愛好者，還記得我們上次提到，要讓自己的 Annotation 產生實際的影響，需要配合 `GeneratorForAnnotation` 嗎？那麼這次，我們就來深入瞭解這個與其相關的 library - `source_gen`，它如何協助我們自動生成代碼，以及其強大的應用場景。


首先，讓我們理解 `source_gen` 是什麼。它是 Dart 的一個代碼生成工具，並非 Flutter 獨有，主要用於構建 Annotations 和生成器。它可以自動為我們生成常見的模板代碼，減少手動編寫的冗餘。


### 如何運作


當我們為某個特定的類或函數添加 Annotation 後，`source_gen` 會基於這些 Annotation 和相對應的生成器，自動為我們產生相應的程式碼。例如，有了 `json_serializable`，我們就不需要手動編寫 JSON 的序列化和反序列化代碼了，這一切都可以由 `source_gen` 幫我們完成。那接下來我們就來自己動手寫看看自動化代碼生成吧！


### 基本的使用


要使用 `source_gen`，我們首先需要在 `pubspec.yaml` 中添加相應的依賴。如果只是自己開發使用可以放在 `dev_dependencies`，如果是要寫成 package 提供給其他人用，記得放在 `dependencies` 哦！


```yaml
dependencies:
flutter:
sdk: flutter

dev_dependencies:
build_runner: ^2.0.0
source_gen: ^1.0.0

```


接著，在你的 Dart 檔案中新增 Annotations，如同上一篇談到的 Annotation 可以是任何一個 class，這裡的命名可以自己決定，我們就先取最簡單的 `TestMetadata`。


```dart
class TestMetaData {
const TestMetaData();
}

```


再來寫一個 `test.dart`，他會被加上 Annotation ，並在稍後被加上生成的程式碼，作為這次測試的對象


```dart
import 'package:flutter_day_10_build_runner/test_annotation.dart';

@TestMetaData("doraralab")
class MyClass {}

```


完成 Annotation 後，我們接下來寫最重要的部分，如何解析這個 Annotation。首先新增一個 TestGenerator 的檔案，這裡需要 extends `GeneratorForAnnotation`，用來告訴 build runner 我們要解析的 Annotation 是什麼 ，並且應該要如何生成程式碼。


當中 `generateForAnnotatedElement` 是必須實作的函數，裡面包含三個參數 `element`, `annotation`, `buildStep`，稍後會再來講解他們有什麼作用。現在只關注於他最後產生的結果：生成 `class TestMetaDataFromGenerator{}`的程式碼。


```dart
import 'package:flutter_day_10_build_runner/test_annotation.dart';
import 'package:source_gen/source_gen.dart';

class TestGenerator extends GeneratorForAnnotation {
@override
generateForAnnotatedElement(element, annotation, buildStep) {
/// 生成以下程式
return "class TestMetaDataFromGenerator{}";
}
}

```


然後建立一個 Builder，用來告知 Build Runner 有哪些 Generator 需要去檢查，需要特別注意 `Builder`，是引用自 `'package:build/build.dart'`，可不是我們平常使用的 `material.dart`。


現在支援的 Builder 有三種，分別是 `PartBuilder`、`LibraryBuilder` 和 `SharedPartBuilder`。簡單介紹一下：


- **PartBuilder**:`PartBuilder` 應該是我們最常會碰到的，如 `json_annotation` 生成的檔案。它用於生成部分代碼文件（通常是 `.g.dart` 文件）。當你看到如下註解時，這表示這個文件是由其他生成器產生的：

```dart
part 'filename.g.dart';

```

使用 `PartBuilder` 時，首先需要確定你的原始文件已經包含了這個 `part` 註解。然後使用 `PartBuilder` 定義你的生成器：

```dart
import 'package:source_gen/source_gen.dart';
import 'package:build/build.dart';

Builder myBuilder(BuilderOptions options) =>
PartBuilder([MyGenerator()], '.g.dart');

```

- **LibraryBuilder**:`LibraryBuilder` 用於生成一個完整的庫文件，而不是部分文件。當使用 `LibraryBuilder` 時，不需要 `part` 註解，因為它會生成一個完整的新文件。

```dart
Builder myLibraryBuilder(BuilderOptions options) =>
LibraryBuilder(MyGenerator(), generatedExtension: '.mygenerator.dart');

```

- **SharedPartBuilder**:`SharedPartBuilder` 允許多個生成器共享同一個部分文件。這在你希望將多個生成器的輸出放入同一個 `.g.dart` 文件時非常有用。

```dart
Builder sharedBuilder(BuilderOptions options) =>
SharedPartBuilder([MyGenerator()], 'shared_part');

```


這裡只做簡單的示範，所以選擇最容易做的 `LibraryBuilder`，並填入在上面完成的 `TestGenerator` 就完成摟！


```dart
import 'package:build/build.dart';
import 'package:flutter_day_10_build_runner/generator.dart';
import 'package:source_gen/source_gen.dart';

Builder testBuilder(options) => LibraryBuilder(TestGenerator());

```


終於來到最後一步配置，為了要跑動 Build Runner 我們必須要新增一個 `build.yaml` 到根目錄，然後填上相應的配置：


import 要根據上面的 `testBuilder` 的位置自行修改哦


```yaml
builders:
testBuilder:
# builder 所在處
import: 'package:your_package_name/builder.dart'
# 有哪些 builder 方法
builder_factories: ['testBuilder']
# 生成的新文件后缀
build_extensions: { '.dart': ['.g.part'] }
auto_apply: root_package
build_to: source

```


最後，只需要在命令行中運行以下命令，就可以看到我們自動化產生的程式碼摟：


```bash
flutter packages pub run build_runner build

```


完成後就能看到 `source_gen` 基於你的 Annotations 和生成器，為你生成 `test.g.dart` 文件 🎉


```dart
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// TestGenerator
// **************************************************************************

class TestMetaDataFromGenerator {}

```


到這邊相信大家已經對 `source_gen` 是如何運作的有了基礎的了解，我們再回到 `TestMetaData` 的部分，這次我們加上一點小變化，讓 `TestMetaData` 是可以加入參數的的。例如我們加上 `className` 這個參數。


```dart
class TestMetaData {
final String className;
const TestMetaData(this.className);
}

```


修改 `test.dart`，加上 `className`


```dart
import 'package:flutter_day_10_build_runner/test_annotation.dart';

@TestMetaData("doraralab")
class MyClass {}

```


這次我們要針對 generator 做一些修改，讓他可以去讀懂 `TestMetaData`，並取出 `className` 讓我們使用。這裡就來補充剛剛要補充的 `element`, `annotation`, `buildStep`。


- **`element`**：表示被註解的元素。我們可以通過 `element.kind` 知道被你註解的元素是 class 或是 function 甚至可能是 enum ，不管是哪一種都有對應的 kind。通過 `element.displayName` 可以拿到這個被註解元素的名稱，簡而言之你可以通過這個參數來訪問有關被註解元素的所有信息。

- **`buildStep`**：用來控制寫入與讀取檔案的功能，這部分比較少更動。

- **`annotation`**：這裡的 `annotation` 就是我們上面提供的 TestMetaData，不過我們沒辦法直接把他當成 class 的實體操作，而是要透過 `.read` 或是 `.peek` 的方法來拿到內部 parameter 的值。兩個不同是 `.read` 如果遇到不知道的參數會拋出錯誤，而 `.peek` 會返回 null，下面直接看我們要更改的程式碼。


```dart
import 'package:flutter_day_10_build_runner/test_annotation.dart';
import 'package:source_gen/source_gen.dart';

class TestGenerator extends GeneratorForAnnotation {
@override
generateForAnnotatedElement(element, annotation, buildStep) {
// 用 peek 的話就要去 handle null 的情況，.read 則是可以直接噴錯讓 build runner 失敗
return "class ${annotation.peek("className")?.stringValue ?? "Unknown"}{}";
}
}

```


重新跑 `flutter packages pub run build_runner build`，就可以找到我們的 `test.g.dart`，成為我們想要的結果摟！


```dart
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// TestGenerator
// **************************************************************************

class doraralab {}

```


💡小提示：如果你是使用 vscode，想要 debug 整個 build runner 的過程，可以把下面這段加入到你的 `launch.json`，就可以瞜


```dart
{
"name": "Debug  Generator",
"request": "launch",
"program": ".dart_tool/build/entrypoint/build.dart",
"type": "dart",
"args": ["build"]
},

```


## 結語:


代碼自動生成不僅可以為開發者省去大量的時間，更重要的是，它確保了代碼的一致性和品質。透過 source_gen 的使用，我們能更高效地完成日常的開發工作，並避免許多手工編寫代碼時可能出現的錯誤。希望這篇文章可以幫助你更深入地了解 Flutter 背後的工具與技巧，並激發你進一步探索其它強大的功能。未來的開發之路，願我們能更快、更好、更強!
