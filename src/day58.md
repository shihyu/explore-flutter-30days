# Day 58：Flutter  Flow 不是 FlutterFlow

> 原文來源：[Day 28：Flutter  Flow 不是 FlutterFlow](https://ithelp.ithome.com.tw/articles/10339043)

今天來講一個時常被大家遺忘的 Widget：Flow。現在提到 flutter flow 大家第一個反應應該是 Flutter nocode 的工具，但其實 Flutter 中原本就存在一個名為 Flow 的 Widget，Flow Widget 是一個相對少用但功能強大的 Widget。它允許開發者直接控制其子元件的位置和大小，而無需透過框架的布局算法。可以達成一些不常見的客製化 UI。


### 主要組件：


- **FlowDelegate**：這個 Delegate 包含繪製子元件的邏輯。主要方法有：


**`paintChildren`**: 在此方法中，你會決定每個子元件的位置和大小。

- **`shouldRepaint`**: 決定 Flow 是否需要重新繪製。

- **`shouldRelayout`**: 決定 Flow 是否需要重


- **children**：要由 Flow 布局的子元件列表。


### 如何使用


Flow Widget 依賴於兩個主要組件：


- `FlowDelegate`：這是用於決定子元件如何排列的邏輯。

- `children`：這是一系列的子元件。


`FlowDelegate` 的 `paintChildren` 方法允許你直接控制子元件的位置。


### 性能問題


- **計算量**：由於 Flow Delegate 的 `paintChildren` 和 `shouldRepaint` 都會經常被呼叫，如果你的排列邏輯複雜，這可能會對性能產生影響。

- **不支援自動佈局**：Flow 不會自動調整大小或位置，所以如果你的 UI 需要根據內容動態調整，Flow 可能不是最佳選擇。

- **過度使用**：Flow 是一個強大的工具，但並不適合所有情境。在大多數情境下，使用 Flutter 提供的其他佈局工具（如 Column, Row, Stack 等）可能更為高效和直觀。


### 範例程式碼


我們接下來要示範的如何透過 Flow 來達到 Wrap 的效果，在這個範例中，**`SpacingFlowDelegate`** 用來設置元件之間的間距，使每個元件之間都有一定的距離。


完整程式碼：


```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
const MyApp({super.key});

@override
Widget build(BuildContext context) {
return MaterialApp(
debugShowCheckedModeBanner: false,
home: Scaffold(
body: SafeArea(
child: Flow(
delegate: SpacingFlowDelegate(spacing: 8.0),
children: List.generate(20, (index) {
return Container(
color: Colors.teal[100 * ((index % 5) + 1)],
width: 60.0,
height: 40.0,
);
}),
),
),
),
);
}
}

class SpacingFlowDelegate extends FlowDelegate {
final double spacing;

SpacingFlowDelegate({required this.spacing});

@override
void paintChildren(FlowPaintingContext context) {
double offsetX = 0.0;
double offsetY = 0.0;
int row = 0;

for (int i = 0; i  context.size.width) {
// Wrap to next line.
row++;
offsetX = 0.0;
offsetY = (size?.height ?? 0) * row;
}

context.paintChild(i,
transform:
Matrix4.translationValues(offsetX, offsetY + row * spacing, 0.0));
offsetX += (size?.width ?? 0) + spacing;
}
}

@override
bool shouldRepaint(SpacingFlowDelegate oldDelegate) {
return oldDelegate.spacing != spacing;
}
}

```


展示效果：
![](images/20117363PHlZ6WKxc4.png)


我們專注來看 `paintChildren`，是如何幫助我實現這個目標


- **初始化偏移量**:

```dart
double offsetX = 0.0;
double offsetY = 0.0;


```

初始化了兩個偏移量，`offsetX` 和 `offsetY`，用於記錄當前子元件的要繪製的位置。

- **檢查是否需要換行**:

```dart
if (offsetX + (size?.width ?? 0) > context.size.width) {
// Wrap to next line.
row++;
offsetX = 0.0;
offsetY = (size?.height ?? 0) * row;
}


```

檢查當前子元件的寬度加上其橫向偏移量是否超過了 `Flow` 的寬度。如果超過，則需要將元件放到下一行。知道要換行後，將 `offsetX` 重置為0，並根據當前的行數（`row`）更新 `offsetY`，使其下移。

- **繪製子元件**:

```dart
context.paintChild(i,
transform:
Matrix4.translationValues(offsetX, offsetY + row * spacing, 0.0));


```

使用 `paintChild` 方法繪製子元件，並使用 `Matrix4.translationValues` 設置其位置。這裡，元件的 Y 軸偏移量不僅基於其在第幾行，還加上了額外的間距（`row * spacing`）。

- **更新橫向偏移量**:

```dart
offsetX += (size?.width ?? 0) + spacing;

```

繪製完當前的子元件後，更新 `offsetX`，以便於下一個子元件可以放在其右側。這裡你也加上了一個 `spacing` 來確保子元件之間有足夠的間距。


透過以上的方法，成功地實現了一個自定義的 `Wrap` 效果。當子元件超出 `Flow` Widget 的寬度時，它會自動移到下一行，且每行之間有一定的間距。


還可以加上動畫演示一下：


```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
const MyApp({Key? key}) : super(key: key);

@override
_MyAppState createState() => _MyAppState();
}

class _MyAppState extends State with SingleTickerProviderStateMixin {
late AnimationController _controller;

@override
void initState() {
super.initState();
_controller = AnimationController(
duration: const Duration(milliseconds: 800),
vsync: this,
)..addListener(() {
setState(() {});
});
}

@override
Widget build(BuildContext context) {
return MaterialApp(
debugShowCheckedModeBanner: false,
home: Scaffold(
floatingActionButton: FloatingActionButton(
child: Icon(
_controller.isCompleted ? Icons.close : Icons.play_arrow,
),
onPressed: () {
if (_controller.isCompleted) {
_controller.reverse();
} else {
_controller.forward();
}
},
),
body: SafeArea(
child: Flow(
delegate: SpacingFlowDelegate(spacing: 100.0 * _controller.value),
children: List.generate(20, (index) {
return Container(
color: Colors.teal[100 * ((index % 5) + 1)],
width: 60.0,
height: 40.0,
今天來講一個時常被大家遺忘的 Widget：Flow。現在提到 flutter flow 大家第一個反應應該是 Flutter nocode 的工具，但其實 Flutter 中原本就存在一個名為 Flow 的 Widget，Flow Widget 是一個相對少用但功能強大的 Widget。它允許開發者直接控制其子元件的位置和大小，而無需透過框架的布局算法。可以達成一些不常見的客製化 UI。              );
}),
),
),
),
);
}

@override
void dispose() {
_controller.dispose();
super.dispose();
}
}

class SpacingFlowDelegate extends FlowDelegate {
final double spacing;

SpacingFlowDelegate({required this.spacing});

@override
void paintChildren(FlowPaintingContext context) {
double offsetX = 0.0;
double offsetY = 0.0;
int row = 0;

for (int i = 0; i  context.size.width) {
// Wrap to next line.
row++;
offsetX = 0.0;
offsetY = (size?.height ?? 0) * row;
}

context.paintChild(i,
transform:
Matrix4.translationValues(offsetX, offsetY + row * spacing, 0.0));
offsetX += (size?.width ?? 0) + spacing;
}
}

@override
bool shouldRepaint(SpacingFlowDelegate oldDelegate) {
return oldDelegate.spacing != spacing;
}
}

```


效果展示：


[gif](images/giphy.gif)


## 結論：


**優點**：


- **靈活性**：Flow 提供了高度的自訂能力，讓開發者能夠完全控制子元件的位置和大小。

- **不受制約**：相對於 Flutter 的其他布局 Widgets，Flow 不完全依賴於框架的布局算法，給予開發者更多的自主權。

- **特殊場景的首選**：對於需要特定排列的子元件，Flow 提供了獨特且有效的解決方案。


**缺點**：


- **學習曲線**：對於新手來說，Flow 的使用和理解可能需要一些時間。

- **性能考量**：如果排列邏輯過於複雜，可能會影響到性能。

- **過度使用的風險**：雖然 Flow 功能強大，但並不是每個場景都適合用它。在許多常見的布局情境下，使用 Flutter 的其他佈局 Widgets 可能更為簡單且高效。


Flow 是一個功能強大且具有高度靈活性的 Widget。雖然它可能不像其他常用的布局 Widgets 那麼知名，但在特定的使用情境下，它是一個不可或缺的工具。如同所有的工具，了解何時使用它和如何有效地使用它都是關鍵。希望這篇文章能夠幫助你了解和掌握 Flow Widget 的魔法，並鼓勵你在合適的場合嘗試使用它。
