# Day 42：噫！從外到內看 Flutter 渲染引擎 2｜GLSL 與 Shader

> 原文來源：[Day 12：噫！從外到內看 Flutter 渲染引擎 2｜GLSL 與 Shader](https://ithelp.ithome.com.tw/articles/10328282)

在上一篇講到 Impeller 與 Skia 不同，Impeller 在構建過程中而不是在運行時編譯 Shader。在構建過程中，Impeller Shader 編譯器（impellerc）將 GLSL（**OpenGL Shading Language**）編譯成 SPIRV。而我們今天要一起來實作的，就是如何自己完成 Shader 的編寫，


GLSL 是一種用於在 OpenGL 和 OpenGL ES 中編程著色器的高級著色語言。另一方面，SPIRV 是一個不僅限於 OpenGL 和 OpenGL ES，還可以與其他圖形技術一起使用的著色器代碼的高效表示形式。impellerc 將 GLSL 代碼轉換成 SPIRV 以實現跨平台兼容性和著色器的高效執行。編譯的輸出是 SPIRV 模塊形式的二進制 blob，可以由圖形驅動程序或運行時加載和執行。因此，這些 SPIRV 模塊（二進制 blobs）可以在各種平台上執行。


在 Flutter 的工作中，通常會把要繪製到畫面上的方法分成兩種：Widget 與 Canvas ，這兩者都能協助我們在螢幕上呈現畫面的效果，Widget 是透過 RenderObject 來描述要如何繪製到畫面上，而 Canvas 則是透過操作 Painter 直接告知畫面要如何繪製，顯而易見的 Widget 是透過 RenderObject 轉譯過後的內容，效能上肯定不比直接繪製的好，所以一般來說如果要繪製更複雜的動畫效果，我們同常會使用 Canvas 來操作，如果大家對 Canvas 有興趣，之後也能做一期專門的解說。


![](images/20117363aDPGNsacu0.png)


而 Shader 就是在操作 Canvas 的過程中，幫助我們達到更客製化的渲染效果。如最簡單、常見的 `LinearGradient`，其中 createShader 其實就是幫助我們透過 API 的方法去建立 shader 。


```dart
final Shader linearGradient = LinearGradient(
colors: [Colors.blue, Colors.red],
).createShader(Rect.fromLTWH(0.0, 0.0, size.width, size.height));

final paint = Paint()..shader = linearGradient;

canvas.drawRect(
Rect.fromLTWH(50.0, 50.0, 200.0, 70.0),
paint,
);

```


### Shader 是什麼？


講了這麼多， Shader 倒底是什麼， Shader 是運行在 GPU 上的一段小程式，主要負責渲染圖形或特效。他們主要分為兩類：Vertex Shaders 和 Fragment Shaders (又稱 Pixel Shaders)。這次我們主要關注的會是 **Fragment Shaders。**


- **Vertex Shaders**：負責處理頂點資料，可用於轉換 3D 物體的頂點座標，應用變形等。

- **Fragment Shaders**：運行於每個像素上，確定最終顯示到螢幕上的顏色。


簡單來說 **Vertex Shaders** 負責骨架，而 **Fragment Shaders** 就是濾鏡啦！


### GLSL 與 .frag


GLSL（**OpenGL Shading Language**） 是一種用於描述 shaders 的語言，其語法與 C 語言相似。而 .frag 是 fragment shader 的標準擴展名，通常包含了描述如何計算像素顏色的 GLSL 程式碼。


### 如何在 Flutter 中使用 Fragment Shader？


那看完上面的介紹，大家應該已經躍躍欲試了，這次的實作就讓我們先來完成自己用 Shader 製作的 LinearGradient 吧！


**建立你的 Shader**：首先需要建立 `.frag` 檔案，我們可以在 Flutter 專案底下的 assets 新增資料夾 shaders 來放置要新增的檔案，我們先把檔案命名為 `my_shader.frag`。這裡我們先不深入講解先接著把設定做完。


```glsl
// my_shader.frag
#version 460 core
out vec4 FragColor;

void main(){
}

```


`version`：表示你要使用的 GLSL 版本。


`FragColor`：表示最後渲染的結果。


**引用 .frag 檔**：到 pubspec.yaml 添加上我們先前增加的 shader


```dart
flutter:
...
shaders:
- assets/shaders/my_shader.frag

```


**在 flutter 中讀取 .frag 檔案**：到 main.dart，新增一個變數為 myShader，shader 必須要被提前讀取，所以我先寫在 main.dart 裡面


```dart
late FragmentProgram myShader;

Future main() async {
myShader = await FragmentProgram.fromAsset("assets/shaders/my_shader.frag");
runApp(const MyApp());
}

```


**繪製到 Canvas**：在這裡我們要配合 Painter 去做到繪製 shader ，所以我們也新建一個 `CustomPaint` 和 `ShaderPainter`，在 `ShaderPainter` 中我們先讓他傳入一個顏色。並且也把 myShader 給傳進去，利用  `Paint()..shader = shader` 來做使用


```dart
return MaterialApp(
home: CustomPaint(
painter: ShaderPainter(
color: Colors.blueAccent,
shader: myShader.fragmentShader(),
),
)
);

class ShaderPainter extends CustomPainter {
final Color color;
final FragmentShader shader;

ShaderPainter({
super.repaint,
required this.color,
required this.shader,
});
@override
void paint(Canvas canvas, Size size) {
canvas.drawRect(
Rect.fromLTWH(0, 0, size.width, size.height),
Paint()..shader = shader,
);
}

@override
bool shouldRepaint(covariant ShaderPainter oldDelegate) {
return true;
}
}

```


到這裡就都設定完成了，接下來我們一起完成 shader 吧。首先回到 my_shader.frag，為了要渲染顏色，新增一個變數 uColor 接受外面傳進來的變數。


```dart
#version 460 core

uniform vec4 uColor;

out vec4 FragColor;

void main(){
FragColor = uColor;
}

```


`vec4`：表示是四個符點數的向量，分別對應顏色的 rgba。


glsl 還有一些常見的數據類型：
**數據類型**:


- **`int`**: 整數

- **`float`**: 單精度浮點數

- **`vec2`**, **`vec3`**, **`vec4`**: 2, 3, 4成分的浮點數向量

- **`mat2`**, **`mat3`**, **`mat4`**: 2x2, 3x3, 4x4的矩陣


再回到 main.dart 我們要把顏色傳遞給 shader，由於 rgba 的值在 shader 中是 0~1，但在 Flutter 中是 0~255，所以我們必須幫他轉一下格式 `color.red.toDouble() / 255` 。


**傳入變數**：設定變數的方法也有些奇葩，我們在 my_shader.frag 檔案裡面宣告了 `uniform vec4 uColor`，這個變數，vec4 代表他是四個浮點數的向量，flutter 不支援直接傳入一個向量所以必須在 `ShaderPainter` 中依序設定 `shader.setFloat(0..3)`，就會自動對應上 vec4 每個向量，非常奇葩，但目前只能先這樣做。


```dart
class ShaderPainter extends CustomPainter {
final Color color;
final FragmentShader shader;

ShaderPainter({
super.repaint,
required this.color,
required this.shader,
});
@override
void paint(Canvas canvas, Size size) {
shader.setFloat(0, color.red.toDouble() / 255);
shader.setFloat(1, color.green.toDouble() / 255);
shader.setFloat(2, color.blue.toDouble() / 255);
shader.setFloat(3, color.alpha.toDouble() / 255);

canvas.drawRect(
Rect.fromLTWH(0, 0, size.width, size.height),
Paint()..shader = shader,
);
}

@override
bool shouldRepaint(covariant ShaderPainter oldDelegate) {
return true;
}
}

```


在我們設定好之後，就可以把專案跑起來看看啦！是一個完美的藍色呢！


![](images/20117363H0bVY8I8Df.png)


**正規化螢幕解析度**：打鐵趁熱，由於我們的設備可能是各種大小的窗口，但是在 shader 的世界中我們希望把他對應成 0~1 會更有利於我們後續的所有操作。為了把各式各樣的視窗大小對應成 0~1 ，我們需要把窗口的 uSize 也傳進去給 shader，並透過 Flutter 提供的 runtime_effect。透過


`vec2 uv = FlutterFragCoord() / uSize`，uv 就是經過正規化後的 xy 距離啦。


```dart
#version 460 core
#include

uniform vec2 uSize;
uniform vec4 uColor;

out vec4 FragColor;

void main(){
vec2 uv = FlutterFragCoord() / uSize;
FragColor = uColor;
}

```


由於要多填入 uSize，我們需要在 ShaderPainter 也作出相應的調整，size 可以直接從 canvas 取用。


```dart
class ShaderPainter extends CustomPainter {
final Color color;
final FragmentShader shader;

ShaderPainter({
super.repaint,
required this.color,
required this.shader,
});
@override
void paint(Canvas canvas, Size size) {
shader.setFloat(0, size.width);
shader.setFloat(1, size.height);
shader.setFloat(2, color.red.toDouble() / 255);
shader.setFloat(3, color.green.toDouble() / 255);
shader.setFloat(4, color.blue.toDouble() / 255);
shader.setFloat(5, color.alpha.toDouble() / 255);

canvas.drawRect(
Rect.fromLTWH(0, 0, size.width, size.height),
Paint()..shader = shader,
);
}

@override
bool shouldRepaint(covariant ShaderPainter oldDelegate) {
return true;
}
}

```


**加上漸變色**：玩成螢幕正規化的調整後，為了要完成顏色漸變，我們還要再新增一個顏色，並且傳入給 shader，這裡就是上面操作的重複直接上程式碼。


```dart
class ShaderPainter extends CustomPainter {
final Color color1;
final Color color2;
final FragmentShader shader;
final int shift;

ShaderPainter({
super.repaint,
required this.color1,
required this.color2,
required this.shader,
required this.shift,
});
@override
void paint(Canvas canvas, Size size) {
shader.setFloat(0, size.width);
shader.setFloat(1, size.height);
shader.setFloat(2, color1.red.toDouble() / 255);
shader.setFloat(3, color1.green.toDouble() / 255);
shader.setFloat(4, color1.blue.toDouble() / 255);
shader.setFloat(5, color1.alpha.toDouble() / 255);
shader.setFloat(6, color2.red.toDouble() / 255);
shader.setFloat(7, color2.green.toDouble() / 255);
shader.setFloat(8, color2.blue.toDouble() / 255);
shader.setFloat(9, color2.alpha.toDouble() / 255);

canvas.drawRect(
Rect.fromLTWH(0, 0, size.width, size.height),
Paint()..shader = shader,
);
}

@override
bool shouldRepaint(covariant ShaderPainter oldDelegate) {
return true;
}
}

```


在傳入 `uColor1` 和 `uColor2` 後，我們就可以使用 `mix` 的方法，來改變顏色的渲染啦！`mix` 會幫我們混合兩種顏色，可以指定顏色的方向，可以是 `uv.x` 或是 `uv.y`


```dart
#version 460 core
#include

uniform vec2 uSize;
uniform vec4 uColor1;
uniform vec4 uColor2;

out vec4 FragColor;

void main(){
vec2 uv = FlutterFragCoord() / uSize;
FragColor = mix(uColor1, uColor2, uv.x);
}

```


hot reload 就能看到我們的最終成果啦～ 恭喜你已經自己完成用 shader 製作 LinearGradient 的整個流程！是不是很有成就感呀！


![](images/20117363IZD0D3nKXc.png)


### 總結


使用 shaders 在 Flutter 中可以開啟全新的視覺效果之門。通過學習和實驗 GLSL 語言，你可以為你的 Flutter 應用程序打造獨特和令人印象深刻的動畫和特效。希望本篇文章可以為你提供一個良好的起點，開始你的 shader 旅程！（或是當作有趣的知識看看也很不錯呀 ），其實 shader 還能做到更不可思議的渲染，但是礙於長度與難度問題，我就只在這裡分享幾個案例（發現 gif 傳不上來，不然這些都是會動的哦！），詳細的解說未來有機會再詳細分享摟！


![](images/20117363DXyOq0zK8T.png)![](images/20117363mVSK0pRMLy.png)
