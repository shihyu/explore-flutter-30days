# Day 55：等等！我要進入 Zone 了｜Flutter 三大例外處理

> 原文來源：[Day 25：等等！我要進入 Zone 了｜Flutter 三大例外處理](https://ithelp.ithome.com.tw/articles/10337879)

我們都知道在寫程式的時候，總是會碰到一些預期之外的問題。有時我們知道在哪裡可能會出錯，所以會用 try-catch 來捕捉這些問題。但是，當錯誤發生在我們無法預知的地方，或者是在 Flutter 的異步操作中，甚至是在渲染期間出現問題，我們該怎麼辦呢？。今天將為大家詳細介紹 Flutter 中的三大例外處理方式，以及如何在不同的場景下選擇適合的錯誤處理方法。


### Flutter Exception Capture


在 Flutter 中我們最常用到的錯誤處理就是 `try-catch`：


```dart
try{
throw SomeException;
} catch(e){
print(e);
}

```


如果是異步的方法，Dart 沒辦法直接捕獲他的錯誤，必須要用 await 才能正確 catch 到錯誤：


```dart
try{
await Future.error("Error");
} catch(e){
print(e);
}

```


會無法被捕獲的原因是：Flutter 是單線程的語言，所以無法去捕獲異步方法的錯誤。之後有機會再深入講解。


上面是我們一般處理錯誤異常的方法，但是 `try-catch`


通常用於我們已經知道，或是可預期他會出錯的方法，而我們要介紹： Zone 處理的是我們無法預期他在哪個環節出錯，但希望可以把錯誤囊括搜集的辦法。


**Zone**


在 Day 6 的時候，我們有講過 Sentry：一個強大的實時錯誤追蹤平台。而 Sentry 是如何捕獲 Flutter 的錯誤並且傳到平台上處理的呢？不知道大家有沒有想過這個問題。這一切源頭都要回歸到 Zone 這個特殊的方法。那 Zone 到底是什麼呢？接下來我們一起探索吧


Zone 可以補足的就是 try catch 抓不到的異步問題，這裡我們直觀地用比較法來看 Zone 和 `try-catch` 之間的差異。


**範圍與目的**:


- `try-catch`：主要用於捕獲並處理當前代碼塊中可能出現的異常。它主要用於處理已知可能出現異常的代碼片段。

- `runZonedGuarded`：創建一個新的區域，並捕獲這個區域中的所有異常。它主要用於捕獲異步操作中的異常，或當你想要在一個特定的區域中集中處理所有的異常。


```dart
void riskyFunction() {
try {
Future.error(Exception('Future error'));
} catch (e) {
// 不會被打印出來。
print('Try Caught : $e in riskyFunction');
}

runZonedGuarded(() {
Future.error(Exception('Zone error'));
}, (error, stackTrace) {
// 正常打印
print('runZonedGuarded :$error in riskyFunction');
});
}

```


**自定義行為**:


- 使用 zones，你可以設定自定義行為，例如更改時間、打印行為等。**`runZonedGuarded`** 只是其中一個捕獲異常的功能。

- **`try-catch`** 只是捕獲異常。


`runZonedGuarded` ****常用的另一個行為就是覆蓋 Print 的行為：


```dart
runZonedGuarded(() {
runApp(const MyApp());
}, (e, s) {
// handle exception here
}, zoneSpecification: ZoneSpecification(
print: (Zone self, ZoneDelegate parent, Zone zone, String line) {
// 在這裡，我們可以自定義 print 函數的行為
// 例如，我們可以加上 "Intercepted: " 前綴
parent.print(zone, "Intercepted: $line");
}));
}

void printTest() {
print("Test");
}

最終會輸出
Intercepted: Test

```


以上就是 Zone 的簡單介紹。Dart 的 **`Zone`** 概念在一開始可能會有些混淆，但它為開發者提供了極大的靈活性，特別是在錯誤處理和自定義行為方面。如果你正在開發大型的 Dart 或 Flutter 應用，了解和利用 Zones 可能會非常有助於提高應用的穩定性和可維護性。


## Flutter Error


**`FlutterError`** 是一種特殊的錯誤，表示框架本身遇到了問題，例如渲染錯誤或框架的內部不一致。當這些錯誤發生時，框架提供了一個回調，允許開發者捕獲和處理這些錯誤，而不是讓整個應用崩潰。通常我們會看到的就是紅底黃字的畫面，如果是 release 版本，看到的就會是灰色的屏幕。


要處理這類型的錯誤也很簡單，Flutter 提供了 FlutterError.onError 的 callback，在這個 callback 裡面就可以捕獲各種 Flutter Error 來做例外處理：


```dart
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
FlutterError.onError = (details) {
FlutterError.presentError(details);
};
runApp(const MyApp());
}

```


如果要替換掉原本黑底紅字（release 版本上是灰屏）也很簡單，只要多寫一個 `ErrorWidget.builder` 把你要替換掉的 Error Widget 放進去即可！


```dart
class MyApp extends StatelessWidget {
const MyApp({super.key});

// This widget is the root of your application.
@override
Widget build(BuildContext context) {
return MaterialApp(
title: 'Flutter Demo',
theme: ThemeData(
colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
useMaterial3: true,
),
home: const MyHomePage(title: 'Flutter Demo Home Page'),
builder: (context, widget) {
Widget error = const Text('...rendering error...');
if (widget is Scaffold || widget is Navigator) {
error = Scaffold(body: Center(child: error));
}
ErrorWidget.builder = (errorDetails) => error;
if (widget != null) return widget;
throw ('widget is null');
},
);
}

```


### Platform method exception


假設今天出錯的地方是在 `invokeMethod` 裡面，`FlutterError.onError` 並不會偵測到這裡的錯誤，我們必須使用  `PlatformDispatcher`：


```dart
import 'package:flutter/material.dart';
import 'dart:ui';

void main() {
MyBackend myBackend = MyBackend();
PlatformDispatcher.instance.onError = (error, stack) {
myBackend.sendError(error, stack);
return true;
};
runApp(const MyApp());
}

```


**`onError`** 是一個 callback，在 Flutter 的 root isolate 出現問題時，這個 callback 會被叫到工作。


- **為什麼要用它？**如果你的 Flutter 程式裡有些東西出錯了，而你沒有其他地方處理那個錯誤，這個 callback 就會跳出來，給你一個機會處理那個錯誤。

- **返回 `true` 和 `false` 的區別？**

如果你的 callback 處理了錯誤，就返回 **`true`**。這告訴 Flutter：「放心，我已經處理了這個問題。」

- 如果返回 **`false`**，或者什麼都不返回，Flutter 會認為你沒有處理錯誤，它會用它自己的方式來表示錯誤，通常是把錯誤訊息顯示出來。


- **關於其他的小部分 (isolates)**:如果你的 Flutter 程式有其他子isolates，這個 **`onError`** callback 不會直接幫你處理那些小部分的錯誤。如果那些小部分有錯誤，你需要自己另外處理，或把那些錯誤傳給主要部分。


## 總結


錯誤處理是每一位開發者都需要面對的課題。Flutter 提供了多種強大的工具和方法，讓我們能夠更輕鬆地捕捉和處理各種錯誤。無論是可預知的 **`try-catch`**，還是當我們不確定錯誤可能發生的地方的 Zone，或者是框架層面的 **`FlutterError`** 和 **`PlatformDispatcher`**，Flutter 都為我們提供了完善的解決方案。掌握這些知識，將有助於我們建立更加穩定和可維護的應用。希望這篇文章能夠對大家有所幫助，讓大家在遇到問題時，能夠更加從容不迫地應對。
