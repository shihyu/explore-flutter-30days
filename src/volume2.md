# 下冊（Day 16-30）

## Day 16: 聊聊 Flutter 圖像使用的良好習慣，記憶體掌握與優化！

- 發布時間：2023-10-01 19:12:49
- 原文連結：<https://ithelp.ithome.com.tw/articles/10332083>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 16 篇

![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687Kwlcbodsha.png)

相信大部分 APP 都會使用到圖片，可能場景有貼文牆、大頭照、上傳圖片等等，在實作時大家是否有關心過記憶體的使用情況呢？或許在開發時、在自己的裝置上都運行的順暢，沒有什麼問題，但有確定在使用者的裝置上表現會相同嗎？本文就這部分，有關圖片、圖像的使用，要跟大家分享一些開發觀念、使用技巧與工具，如何讓我們有效率的存取它們，並確保 APP 的記憶體有正常使用，避免不當消耗。

深呼吸一口，我們開始吧！

------------------------------------------------------------------------

## 圖檔格式的選用

- `png`
  - 圖像是光柵圖形，由像素網格組成
  - 檔案大小通常較大
  - 適用於高細節、高復雜性、高解析，或者需要透明度具有透明背景的圖像，例如：照片
- `jpg` → 適合一般圖片，大小適中
- `webp` → 新型格式，可代替 `png`、`jpg`、`gif`，容量相對小很多，支援有損和無損壓縮、透明背景
- `avif` → 新型格式，跟 `webp` 支援度差不多，但是多了 HDR 顏色
- `svg`
  - 圖像是矢量圖形，由數學演算定義的形狀、曲線和直線組成
  - 檔案非常小
  - 適用於簡單的線條、隨意調整大小的圖形，可以任意縮放並保持相同品質
  - 例如：圖標

補充：在 Flutter 中，使用過多的 SVG 圖像可能會對應用的渲染性能產生一定影響。 需要更多的處理和解析，因為它們包含了矢量數據和復雜的路徑資訊。因此，使用大量的 SVG 圖像可能會導致變慢，特別是在較舊的設備上。不過以後不需要太擔心，此現象在新的 Impeller 引擎上有很大的優化，能有效降低計算成本，複雜的場景也能保持順暢，但是也要等到 Android 釋出 Impeller 後才算完全支援，請大家再等待一下了。

## 存取本地圖檔

大家在使用圖檔的時候請避免使用 **hard-coding** 的方式將字串寫死，雖然剛開始學習 Flutter 到一段時間後，還是覺得這樣當下很方便，已經產生習慣了，但還是請改掉這個行為。

它的缺點有幾個：

1.  打錯字就出問題了
2.  10個地方使用同一張圖片，需要輸入完整的字串10次
3.  難以管理和維護

請使用一個自定義的本地圖檔類別去紀錄所有的路徑，使用 static const 去宣告每個字串，除了好管理之外、效能也會更好。以後圖像改了、路徑變了，就到類別裡去做修正，即可完整需求。

以下方範例來看，創建了 **AppAssetsPath** 類別，再裡面提供了 iconHome 這個 `static const` 字串，代表對應的圖檔路徑。讓整體的可維護性提高，以統一入口去存取圖檔，實際上在元件上的存取方式也很直覺、簡單，不用再浪費時間打字了。

``` dart
@immutable
final class AppAssetsPath {
  const AppAssetsPath._();

  static const String iconHome = 'assets/images/home.jpg';
}

// UI code
Image.asset(AppAssetsPath.iconHome),
```

相信有些開發者還是覺得自己要寫類別，再新增每個圖檔常數很麻煩，所以還有一種大家常用的方式，代碼生成 Codegen。透過 **flutter_gen** 套件幫我們自動生成所有內容，我們只需要做一點設定，最後再 Terminal 執行 `dart run build_runner build -d` 指令，即可實現我們的使用需求。詳細請看 pub.dev。

> [Package: flutter_gen](https://pub.dev/packages/flutter_gen)

## 圖檔壓縮

#### 壓縮後再上傳到雲端

適當地壓縮圖像對於上傳大量圖片，或是請求圖檔資料時都很有幫助，當然壓縮後的品質需要確認是否達到標準，才不會為了壓縮導致呈現出來很粗糙。

- 減少遠端下載的頻寬
- 減少使用時所需要的記憶體
- 降低本地資源的大小
- 加快載入速度

🐦 使用 **flutter_image_compress** 套件壓縮圖檔

``` dart
final file = await FlutterImageCompress.compressAndGetFile(
  file.absolute.path, 
    targetPath,
  quality: 90,
  rotate: 180,
);
```

> [Package: flutter_image_compress](https://pub.dev/packages/flutter_image_compress)

#### 壓縮後再放入本地目錄

以下提供相關的網站和工具：

1.  **Squoosh** → GoogleChromeLab 推出的開源專案，處理速度快，在壓縮後可瀏覽前後的圖像對比照，輸出高品質的壓縮圖像。[網站](https://squoosh.app/)  
    ![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687S7VJ4KQZci.png)

2.  **tinypng** → 知名熊貓，進行有損壓縮，減少圖像中的顏色數量，降低 WEBP、JPEG 和 PNG 的檔案大小。[網站](https://tinypng.com/)  
    ![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687Bmqcv0ZzeE.png)

3.  **ImageOptim** → macOS App，可以直接到官網下載，使用起來直覺簡單，只需要將圖檔拉進去、匯入，圖片就會自動開始處理，壓縮後直接覆蓋原檔。[網站](https://imageoptim.com/mac)

> [Github](https://github.com/ImageOptim/ImageOptim)  
> ![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687oSuF0aEvLD.png)

## 限制寬高，不儲存過大的圖像

當專案需要載入高解析度的圖像時，特別是無限滾動的貼文列表、動態牆等等，很可能會導致卡頓，因為將原始圖像壓縮到螢幕的顯示尺寸，這個任務很繁重且耗時。如果 APP 特別只在手機端上運行，需要考量到是否還需要將大圖像提供給 client 端，是否可以在後端進行壓縮和調整。

#### 優點

1.  減少圖像的體積、大小
2.  減少記憶體的使用
3.  載入的時間更短、更快
4.  保持順暢，體驗避免卡頓
5.  提升渲染圖像的性能  
    ![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687FNz0ivlh3P.png)

#### 設置緩存大小

在小區域顯示一個大尺寸圖像，Image 本身可以設置指定的緩存長寬，使用 `cacheWidth` 和 `cacheHeight`，進行圖像解碼並以指定大小存儲在記憶體，這將避免在解碼過程中產生不必要的成本消耗和硬碟空間的使用，最後保存調整過後的小圖像。

``` dart
Image.asset(
    'assets/images/flutter.png',
    cacheWidth: 100,
    cacheHeight: 100,
),

Image.network(
    'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
    cacheWidth: 100,
    cacheHeight: 100,
),
```

假設有設置 `cacheWidth` 或是 `cacheHeight` 兩個參數，內部會使用 ResizeImage 進行處理，將圖像 decode 成指定尺寸的 ImageProvider。在處理過後可能會失去一些細節，不過使用上的記憶體可以有效減少。  
![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687MVZa5XFWk8.png)

自行處理圖像的範例：  
透過 MediaQueryData 取得螢幕尺寸和像素比，根據 `scale` 計算出新的尺寸，最後返回新的 ImageProvider 讓元件使用。

``` dart
ImageProvider optimizeImageSizeWithScale(
  BuildContext context, {
  required ImageProvider imageProvider,
  double scale = 1,
}) {
  final Size size = MediaQuery.sizeOf(context);
  final double devicePixelRatio = MediaQuery.devicePixelRatioOf(context);
  final Size newSize = size * devicePixelRatio * scale;

  return ResizeImage(
    imageProvider,
    width: newSize.width.round(),
  );
}

// Usage
Image(
  image: optimizeImageSizeWithScale(
    context,
    imageProvider: const NetworkImage('https://upload.wikimedia.org/wikipedia/commons/4/4f/Dash%2C_the_mascot_of_the_Dart_programming_language.png'),
    scale: 0.8,
  ),
),
```

![](https://ithelp.ithome.com.tw/upload/images/20231001/201206872DO3zmT8YR.png)

#### 從設備抓取圖像

如果今天是要上傳照片、圖片到後端，以大家熟悉的 **image_picker** 套件來看，它有提供 `maxWidth`、`maxHeight`、`imaqeQuality` 三個參數可以設置，除了能有效避免圖像過大以外，還可以輕鬆地壓縮品質。這些都可以根據實際的使用場景去決定，也許 APP 不需要最好的品質和尺寸去顯示，即可有好的效果。

``` dart
_picker.pickImage(
    source: source,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    imageQuality: imageQuality, // 0 ~ 100
)
```

> [Package: image_picker](https://pub.dev/packages/image_picker)

## 預先載入圖像

很常我們會在專案裡的 `assets` 目錄放置一些本地圖檔，屬於不會更改且頻繁出現的圖片，如果剛好在頁面創建的時候要顯示大量的圖片，例如：100、200張，這時候一定會看到圖片陸續被載入或是沒有顯示上非常的絲滑。

你可能想說本地檔案不是應該會很順嗎，為什麼一樣會延遲？因為即便圖像是從本地載入不是雲端，它們都需要先被緩存到記憶體，接著在呈現到畫面上，而不是直接就能顯示。

這時候就需要在 Splash Page 或是在頁面一開始的時候進行預先載入，讓大部分圖片都可以在 `build()` 方法觸發之前先準備好，能夠有效避免遲緩的情況。

- Flutter Framework

``` dart
// Precache local
precacheImage(AssetImage(imgPath), context);

// Precache remote
precacheImage(NetworkImage(imgUrl), context);
```

![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687In64EnK2S4.png)

- 使用 **cached_network_image** 套件時，很常會搭配 **flutter_cache_manager** 套件，有自己的 CacheManager 去進行緩存管理，可以在 APP 一開始或是過渡時間進行遠端的圖片緩存

``` dart
// Precache remote if not cache before
await getSingleFile(imgUrl);
```

> [Package: flutter_cache_manager](https://pub.dev/packages/flutter_cache_manager)

## SVG 圖檔預編譯

通常使用到 svg 圖檔大家對 **flutter_svg** 應該都很熟悉，搭配 **vector_graphics_compiler** 套件，允許 svg 生成二進制格式，使用時的解析速度更快，並且可以減少 clipping、masking 和過度繪製的情況。生成以 `.vec` 後綴的 svg 圖檔

在 Terminal 透過指令生成 `svg.vec` 檔案。

``` bash
dart run vector_graphics_compiler -i assets/home.svg -o assets/home.svg.vec
```

在 UI code，使用 `AssetBytesLoader` 載入圖檔。

``` dart
import 'package:flutter_svg/flutter_svg.dart';
import 'package:vector_graphics/vector_graphics.dart';

final Widget homeImage = SvgPicture(
    const AssetBytesLoader('assets/images/icon/home.svg.vec')
);
```

> [Package: flutter_svg](https://pub.dev/packages/flutter_svg)  
> [Package: vector_graphics_compiler](https://pub.dev/packages/vector_graphics_compiler)

## 資源圖檔支援解析度適配

Flutter 支援解析度感知(resolution awareness)，根據設備像素比載入解析度合適的圖像，例如：在像素比 1.8 的設備會使用 `2.0x/` 目錄的圖像; 像素比 2.7 會用 `3.0/` 圖像。

假設我們有一個 `cat.png` 圖檔，在 asset 目錄裡需要提供多倍率的對應檔案，為了適配設備的解析度，避免小尺寸手機載入大尺寸、容量的圖像，這是不必要的需求，而且還會讓載入速度也會變慢，嚴重的話可能很快就會有設備 OOM 情況，導致 APP 崩潰。

如果大家有使用和熟悉 figma 這類的設計軟體，通常在圖檔匯出時都會有倍率可以選擇，操作上很方便。取得檔案後接著在分配到專案的指定路徑，而下方我有提供使用 Dart 撰寫的 script，簡單、快速地幫你自動分配好檔案，大家也不需要浪費時間了。

``` dart
.../cat.png       (mdpi baseline)
.../1.5x/cat.png  (hdpi)
.../2.0x/cat.png  (xhdpi)
.../3.0x/cat.png  (xxhdpi)
.../4.0x/cat.png  (xxxhdpi)
```

撰寫自己的 dart script 幫忙分配圖檔，先將圖檔放到 assets 指定路徑，接著再根目錄使用指令。當然也可以使用 Makefile 執行

``` bash
dart tools/allocate_images.dart ./assets/images
```

![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687AJx9F0dIYa.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687ZxihNOMFIi.png)

> [Github: flutter-tips-and-tricks](https://github.com/chyiiiiiiiiiiii/flutter-tips-and-tricks/tree/main/tips/0001-use-dart-program-to-allocate-resolution-images)

## 圖像搭配 AspectRatio

AspectRatio 元件本身可以讓 child 根據寬長比例去顯示，必須設置 `aspectRatio` 參數，可以在使用時想說寬比長，然後以寬/長來填入。如果是正方形，就是設 1; 如果是寬長 16:9 就是設 1.77，使用上很簡單。它的用處是可以讓我們在開發時不需要設置固定的長寬數值(不同裝置較容易跑版)，可以根據裝置的大小長寬去自動適配，所以這也是在做 APP 多端開發的時候，很常用的一個技巧。有效確保在所有設備上保持圖像的一致性，即使設備的解析度、尺寸不同，它也會自動放大或縮小圖像以符合 UI。

``` dart
// 16:9
const AspectRatio(
    aspectRatio: 1.77,
    child: Image(
        image: NetworkImage(
      'https://upload.wikimedia.org/wikipedia/commons/4/4f/Dash%2C_the_mascot_of_the_Dart_programming_language.png',
    ),
  ),
),
```

## 實作透明圖像

盡量避免在 Image 外層包裹 **Opacity**，雖然能實現效果，但是在背後渲染時的工作成本比較昂貴，濫用會影響運行幀數。詳細可以閱讀另一篇文章，有更多對於 Opacity 的說明。

針對圖像的操作可以使用 Image 本身的 `color` 以及 `colorBlendMode` 參數去做調整，顏色本身可以使用 `fromRGBO()` 建構方法，第四個參數設置指定的不透明度。最後設置 BlendMode 為 `BlendMode.modulate`，讓它可以透過顏色調整圖片，完成我們要的效果

``` dart
// Add white with opacity 0.5
Image(
    image: NetworkImage(
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Dash%2C_the_mascot_of_the_Dart_programming_language.png',
    ),
    color: Color.fromRGBO(255, 255, 255, 0.5),
    colorBlendMode: BlendMode.modulate,
)

// Add green color
Image(
    image: NetworkImage(
    'https://upload.wikimedia.org/wikipedia/commons/4/4f/Dash%2C_the_mascot_of_the_Dart_programming_language.png',
    ),
    color: Color.fromRGBO(160, 239, 180, 1),
    colorBlendMode: BlendMode.modulate,
)
```

![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687nCZx8rfF4p.png)

## 添加 Blurhash 載入效果

為什麼需要載入效果，可以讓使用者的明確知道現在每張圖片都有在載入，載入完成的先顯示，還沒完成的繼續有效果去提醒，盡量不讓使用者看到空白處或是靜止圖片的呈現。根據過去的開發經驗與研究，當看到空白處三秒後使用者會開始不耐煩，對於 APP 的觀感會開始降低，10~15 秒後就會將 APP 關閉、停止。

常見的載入效果，很常會看到旋轉的 indicator 指示器，很方便使用但相對比較普遍。有些 APP 提供品牌的載入動畫，這也是一個選擇，提醒之餘增加趣味性，當然風格也更為強烈。

這裡要跟大家分享 Blurhash 效果，將圖片編碼成30個字元以下的 hash 字串，它代表一個模糊圖像，讓我們在載入圖片時，可以當作 placeholder 呈現，模糊的效果跟原始圖片色塊類似，讓每張圖片也能看出差異。很棒的事，當圖片載入完成時它會以漸變的方式做圖像轉換，從模糊無縫到實際圖片。

實作方式，可以將生成與編碼 hash 的工作內容讓後端負責，可能在 client 上傳圖片後去處理，然後將圖檔 url 跟 hash 存儲起來。 當 client 請求資料時，可以同時收到這兩個東西。 然後接下來就簡單了，載入期間顯示 blurhash 模糊效果，最後將雲端的完整圖像顯示出來。

可以到官網 BlutHash 了解，另外 Github Repo 也有提供每個語言的處理方式，主流語言一定都有支援，當然 Dart 也有，可以在自己的 APP 或是後端進行處理。

> [Wolt - BlurHash](https://blurha.sh/)  
> [Github](https://github.com/woltapp/blurhash)

### 效果範例

![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687pu8gXURVxb.png)  
![Blurhash](https://i.imgur.com/LRuwmMU.gif)

### 開發方式

- 第一種：使用 **blurhash_dart** 套件

``` dart
// blurhash 轉成 Widget
Widget build(BuildContext context) {
    final image = BlurHash.decode('LEHV6nWB2yk8pyo0adR*.7kCMdnj').toImage(35, 20);

    return Image.memory(Uint8List.fromList(encodeJpg(image)));
}

// 圖片生成 blurhash
final data = File('assets/image/test.png').readAsBytesSync();
final image = img.decodeImage(data.toList());
final blurHash = BlurHash.encode(image!, numCompX: 4, numCompY: 3);
```

> 提醒：如果要在 APP 端處理，因為 `encode`、`decode` 都是同步操作，不彷透過 Background Isolate 來處理，確保效能  
> [Package: blurhash_dart](https://pub.dev/packages/blurhash_dart)

- 第二種：使用 **flutter_blurhash** 套件，提供許多 API 可以操作

``` dart
BlurHash(
    hash: r'LBS?GdOG-;$zxua}jtj?~VxCITSi',
    image: 'https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png',
    duration: const Duration(seconds: 2),
    onStarted: onStarted,
    onDecoded: onDecoded,
    onDisplayed: onDisplayed,
),
```

> [Package: flutter_blurhash](https://pub.dev/packages/flutter_blurhash)

- 第三種：使用 **octo_image** 套件，結合 `cached_network_image` 緩存以及 blurhash

``` dart
OctoImage(
    image: CachedNetworkImageProvider(imgUrl),
    placeholderBuilder: OctoPlaceholder.blurHash(blurhash),
    errorBuilder: (context, error, stackTrace) => const Icon(
        Icons.warning_rounded,
        color: Colors.black54,
    ),
    fit: BoxFit.cover,
    width: 300,
    height: 300,
),
```

> [Package: octo_image](https://pub.dev/packages/octo_image)

- 第四種：使用 **blurhash_ffi** 套件，編碼和解碼在背後一次處理完成，不需要取得 hash 才能使用，當然基本的個別操作也有提供

``` dart
import 'package:blurhash_ffi/blurhash_ffi.dart';

class MyImage extends StatelessWidget {
    const MyImage({
        required this.imageUrl,
        super.key,
    });

    final String imageUrl;

    @override
    Widget build(BuildContext context) {
        return Image(
            image: BlurhashTheImage(
                NetworkImage(imageUrl),
                    decodingHeight: 1920,
                    decodingWidth: 1080,
            ),
            alignment: Alignment.center,
            fit: BoxFit.cover,
        );
    }
}
```

> [Package: blurhash_ffi](https://pub.dev/packages/blurhash_ffi)

## 標示大型圖像

使用 debugInvertOversizedImages 通過顏色反轉和顛倒來標示體積過大、使用大量記憶體的圖像。  
![](https://ithelp.ithome.com.tw/upload/images/20231001/20120687yQkH9rOkcg.png)

如果不想開啟 DevTools 也可以在主函式 `main()` 設置。

``` dart
debugInvertOversizedImages = true
```

> 更多且更詳細 Debugging 內容，請看另一篇文章，等待發布。

------------------------------------------------------------------------

## 總結

本文分享了有關圖像的觀念與操作，希望大家可以審視專案是否有正常運用記憶體，尤其是大圖像緩存與載入小空間的部分，沒有注意的話，除了記憶體暴漲之外，也很容易就會造成卡頓。如果有其他圖像的優化方式與內容也非常歡迎提出，我們可以做個討論，一起互相學習。以使用者體驗為第一優先，沒錯吧！

## Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色

- 發布時間：2023-10-02 13:01:00
- 原文連結：<https://ithelp.ithome.com.tw/articles/10332717>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 17 篇

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687xcOrJNKIlp.png)

在 Flutter，狀態管理對於專案來說很重要，不是說一定要用，只是當開發者還不熟悉 Flutter 原理以及刷新觀念，很容易會造成不當開發的效能問題。狀態管理的職責就是讓開發者很輕鬆、容易地去管理狀態，並完成精準更新，省時省力且提升效能。Flutter 本身有提供一些開箱即用的功能**InheritedWidget**、**ChangeNotifier**、**ValueListenableBuilder** 等等，已經可以透過它們實現一個 APP，但是這些 API 總有可改進可加強的部分。

目前在 [pub.dev](http://pub.dev) 上的狀態管理套件、框架非常多，大概20種以上，比較普遍大家知道幾個，Bloc、Riverpod、StateNotifier、Redux、Stacked、MobX、GetX 和 Provider，其實 Riverpod 主要職責不太屬於狀態管理，只是它有這個能力，詳細我們可以另開文章來聊。

對於開發者來說，尤其是剛入門的朋友，都會不知道要從哪個開始學習，當然基本的可以從知名度、like 數量去判斷。而在幾年的 Flutter 經驗裡，可以跟大家分享幾個主流選擇。目前最多產品、企業使用的是 Bloc，以固定流程、嚴謹規範搭配簡單的實作方式，我想是團隊的第一選擇，靈活性沒這麼高但是很穩固。接著第二個選擇是 **Riverpod** 也是本文的主題。

Riverpod 為 **Provider**、**freezed** 原作者 **Remi Rousselet** 所製作，在 Flutter 領域貢獻良多的一位開發者，為了改善 Provider 許多缺點所以有了 Riverpod，而它也是目前主推的狀態管理選項。加上作者本身非常活躍，頻繁與社群互動、表達自己的開發想法，常在各大研討會出現。對於一個開源維護者來說，這點讓使用者很安心，所以近幾年 Riverpod 聲量很高，使用人數持續成長，各種教學資源與範例也持續出現。

到這裡，前面講了這麼多，到底 Riverpod 特別在哪裡，應該很好奇吧？以及如何在專案裡使用它？我為什麼喜歡使用它來開發？趕快往下了解吧！

> [Riverpod](https://docs-v2.riverpod.dev/)

------------------------------------------------------------------------

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687gqjdeQctPQ.png)

Riverpod **is a reactive caching and data-binding framework**。在官網第一眼看到的說明，有發現沒有 State Management 嗎，其實它本身不是狀態管理框架，而是進行響應式緩存以及數據綁定，不是以管理狀態為主軸，但是它有這個能力。這是 “鳥” 與 “鴿” 的問題，當大家說 “狀態管理”（鳥）時，有些人想到的是 “雞”，而 Riverpod 其實是 “鴿子”。Riverpod 可以作為狀態管理者，但很明顯地，它可以做的事更多。大家很常將它認定為狀態管理其實作者也無奈呀。

Riverpod 能夠幫忙處理大部分邏輯，也可以輕鬆執行執行網絡請求或非同步操作，支援錯誤處理和緩存，同時可以執行主動和被動的資源釋放。

## **說明**

如果 Provider 是 **InheritedWidget** 的簡化，那麼 **Riverpod** 就是從頭開始對 **InheritedWidget** 的重新實現。

> 如果 Provider 是蠟燭，那麼 Riverpod 就是燈泡。它們的用途非常相似，但我們不能通過改進蠟燭來製造燈泡。

### Riverpod 保有 Provider 特色，與自身優點

- Riverpod 提供的 Provider 不是 Widget，在 Widget Tree 之外管理 Provider 生命週期，從頭實現了所有的狀態處理機制，沒有依賴 Flutter。它是一個 Dart 物件，所以允許在純 Dart 環境下運行
- 能夠安全地創建、觀察和結束狀態，不必擔心在 Widget 重建時狀態消失
- 組合狀態，在其中一個狀態更新時作出反應
- 當有多個 InheritedWidget 時提高可讀性
- 通過單向數據流使應用更具擴展性
- 所有 Provider 狀態都存儲在 ProviderContainer，由 ProviderScope 創建
- 幫 Widget 區塊綁定狀態裡的某個數值，當此數值更新時 UI 才會刷新，實現 Data Binding

### 比 Provider 更好的部分

- 讀取的物件實體是**編譯安全的**，編譯時就能找出問題，不需要擔心有運行異常，例如：沒有 Provider 創建，進行存取時會有的 **ProviderNotFoundException**
- Riverpod 使用 InheritedWidget 實現，但獨立於 Flutter 之外，使 Provider 模式更加靈活。其實內部有使用 `context`
- 能夠擁有多個相同型別的 Provider
- Provider 可以依賴或監聽其他 Provider
- 可以讓每個狀態都是一個 Provider，或是由 Notifier Provider 去管理多個狀態
- 沒有使用 Provider 的時候，主動銷毀，實現記憶體釋放。甚至可以自行清除狀態
- 可以將 Provider 設置成 private，只屬於某個檔案或 library
- 測試流程很好進行模擬、資料偽造與驗證
- 輕鬆管理異步狀態，使用方式類似 RxDart 的 Subject

## API 重點

### ProviderScope

- 本身為一個 StatefulWidget，負責儲存所有 Provider 提供的狀態，透過自身創建的 **ProviderContainer** 進行儲存
- 使用時會在 Widget Tree 根部包裹一個 **ProviderScope** 或是 **UncontrolledProviderScope**，相當於啟動 Riverpod，是個必須的前置作業
- ProviderScope 除了在根部以外，可以再多個地方重複使用，讓一些 Provider 狀態只限於某個 Widget Tree，不會共享於整個 APP
- 屬性
  - `parent` → ProviderContainer，當我們有其他 ProviderScope 要使用時，可以透過 parent 給予原有的 ProviderContainer，能夠讓 Sub-ProviderContainer 繼續使用原本的所有 Provider 以及狀態
  - `observers` → 自定義 ProviderObserver，在這個 ProviderScope 裡進行一些 Provider 更新的監聽
  - `overrides` → 在當前 ProviderScope 裡複寫原有的 Provider，替代原有的數據
  - `child` → 包裹元件、Widget Tree

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687pzhBnscjV9.png)

### UncontrolledProviderScope

- 通常一樣在 Widget Tree 根部使用，替代 ProviderScope，將 ProviderContainer 暴露給 Widget Tree，讓我們可以自行創建和直接操作它，做一些處理之後再設置給 ProviderScope
- 本身是 InheritedWidget，大部分 API 操作都會經過它，例如：`ref.watch()`、`ref.read()`、`Consumer`，透過 context 在 Element Tree 上取得 ProviderContainer 內容

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687aZyJWwkDPq.png)

### ProviderContainer

- 負責儲存所有 Provider 的狀態，大部分的 Provider 操作都會透過 context 存取 ProviderContainer
- 正常開發中不會去直接面對它，在 ProviderScope 裡會自然被創建，當然也可以在 UncontrolledProviderScope 使用自己的 ProviderContainer

一般可以使用 `ProviderScope.containerOf(context, listen = xx)` 靜態方法拿到 **ProviderContainer**，不同的是 listen 的值。如果沒有監聽需求，`listen` 參數為 false，接著使用 `getElementForInheritedWidgetOfExactType()` 方法，這樣在數據發生變化時元件就不會觸發 `didChangeDependencies()`，避免Widget執行不必要的重建。過程跟我們熟悉的 InheritedWidget 操作相同，需要監聽的話就會依賴 UncontrolledProviderScope，等待通知。  
![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687OGlEcDzREF.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687vfYqWrT7KV.png)

### Consumer

- 負責監聽 Provider 變化，一旦狀態更新會立即被通知，在 UI Code 使用
- 繼承 **ConsumerWidget**，需要透過它取得 WidgetRef
- `builder` → 一個 **ConsumerBuilder** typedef，提供 BuildContext、WidgetRef、Widget 三個參數，可以透過 WidgetRef 執行 `ref.read()`、`ref.watch()` 等 API，執行對 Provider 的操作

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687fbF5hf6gnK.png)

### ConsumerWidget

- 類似 Flutter 擁有的 StatelessWidget，沒有狀態也無法執行 `setState()`，都是透過 WidgetRef 進行 Provider 與 狀態的操作，在 `build()` 方法會提供
- 繼承 **ConsumerStatefulWidget** 的抽象類別，將一些 API 方法隱藏起來，只暴露了 `build()` 給外部使用

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687MdPJpIfpYp.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231002/201206870CjhGckksS.png)

### ConsumerStatefulWidget

實際上就是 Flutter 擁有的 StatefulWidget，只是一個繼承它的抽象類別，跟正常的用法都一樣。搭配 **ConsumerState**，只是 State 多了 WidgetRef 物件可以使用，一樣所有的操作都需要透過它進行

![](https://ithelp.ithome.com.tw/upload/images/20231002/201206874BM7jp7cLV.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687amKSEqta8e.png)

### WidgetRef

- 一個允許元件跟 Provider 互動的物件，透過它存取資料、執行任務處理，所有的狀態管理操作都需要經過 WidgetRef
- 抽象類別，提供許多常用的互動 API，例如：`exists()`、`read()`、`watch()`、`listen()`、`listenManual()`、`refresh()`、`invalidate()`，有經驗的朋友們應該對他們很熟悉吧。實際在使用他們的時候，內部還是使用了 `context`，因為前面提到 Tree Root 使用 **InheritedWidget**，便於在實作時從 **Element Tree** 取得指定 Provider，讓我們高效存取 **ProviderContainer**。

![](https://ithelp.ithome.com.tw/upload/images/20231002/201206871Bxl79KLaB.png)

- WidgetRef 本身其實也是 **BuildContext**，內部都是透過 context 轉型，讓開發者可以直接使用操作 API。對於 ConsumerWidget 和 ConsumerStatefulWidget 來說 BuildContext 就是 **ConsumerStatefulElement**，API 細節都在這裡面

![](https://ithelp.ithome.com.tw/upload/images/20231002/20120687JQQfiI4kXU.png)

以下為 API 簡易說明：

#### exists()

檢查 Provider 是否已經初始化、是否有狀態了

#### read()

取得 Provider 當前狀態，如果是第一次存取就會執行初始化，並緩存狀態

#### watch()

監聽 Provider 狀態變化，一旦有更新，Widget 就會執行 rebuild，或是其他 Provider 進行狀態重整

#### listen()

監聽 Provider 狀態變化，有更新的話，可以經由 callback 取得新舊資料，可以自行處理接下來的任務。例如：顯示 SnackBar、Dialog

#### listenManual()

一樣是監聽 Provider 狀態變化，但跟 `listen()` 不同的是，不適用於 `build()` 方法裡使用，而是在 State 的 `initState()` 或是其他生命週期的位置。另外可以使用 `close()` 停止 Provider 監聽，在某些時候可以自行操控。

#### invalidate()

讓 Provider 狀態消失、無效，確保下次 Provider 被存取時可以重新初始化

#### refresh()

讓 Provider 重新獲取狀態，並返回最新資料。過程中使用了 `invalidate()`，先釋放並立即初始化取得狀態， 例子：重新請求 API

### AutoDispose & autoDispose

資源自動釋放，是 Riverpod 的一大重點。我們可以幫 Provider 加上 `autoDispose` 修飾符，或是使用 Codegen 寫法(keepAlive 屬性預設為 false)，讓 Provider 發現沒有被使用的情況下進行釋放。有關此 `ProviderElement` 的狀態就會自動處理掉，因為不再需要了。

從源碼來看，通常有使用到 autoDispose 操作，背後都會 mixin **AutoDisposeProviderElementMixin**，其中的 `mayNeedDispose()` 就是關鍵，最終執行 `scheduleProviderDispose()`，安排釋放

1.  首先檢查 `maintainState` 屬性，這部分屬於舊版寫法，false 代表不保存狀態
2.  檢查有沒有監聽者，可能是元件或是其他 Provider
3.  現在都是使用 keepAlive 來判斷是否持續存活，如果沒有使用的話代表不保存狀態  
    ![](https://ithelp.ithome.com.tw/upload/images/20231002/201206870KMs9SSYjM.png)

> 之後可以在開一篇文章，我們來探討細部 API 背後所做的一舉一動，應該蠻有趣的

------------------------------------------------------------------------

## 範例

### 自定義 ProviderContainer

- 創建一個給 APP 和 Riverpod 使用的 **ProviderContainer**，可以優先使用它取得初始化 Provider 和服務，提早獲得狀態
- 呼叫 `container.read()` 創建類的實體並初始化，甚至可以更新狀態。很常見的情境是，有些服務的初始化需要非同步操作，可以將這類行為先完成後，再賦予完整狀態，這時候就可以使用 Provider，而不是 FutureProvider。例如：SharedPreference
- 將包裹APP的 `ProviderScope` 更換成 `UncontrolledProviderScope`，並設置 container 屬性，給予自定義的 ProviderContainer 物件

``` dart
class AuthService {
    AuthService();

    Future<void> init() async {
        // Do something...
    }
}

final authServiceProvider = Provider<AuthService>((ref) {
    return AuthService()..init();
});

Future<void> main() async {
    final providerContainer = ProviderContainer();
    providerContainer.read(authServiceProvider);

    runApp(
        UncontrolledProviderScope(
            container: providerContainer,
            child: const MyApp(),
        ),
    );
}
```

### 使用 overrides 覆蓋 Provider 狀態

ProviderContainer 提供了 **overrides** 參數，可以覆寫特定的 Provider，可以提早做一些操作和資料處理。或是進行非同步操作，接著覆蓋一個基本的 Provider，即可省略使用 FutureProvider。在測試時也很方便使用，用來偽造數據、偽照狀態。

``` dart
Future<void> main() async {
    final authService = AuthService();
    await authService.init();

    final providerContainer = ProviderContainer(
        overrides: [
            authServiceProvider.overrideWithValue(authService),
        ],
    );

    runApp(
        UncontrolledProviderScope(
            container: providerContainer,
            child: const MyApp(),
        ),
    );
}
```

------------------------------------------------------------------------

## 總結

開發 APP 過程中一定會有很多狀態，它們牽扯到了記憶體、運算、效能，如何正確管理和處理是個重要課題。在對的時機點使用，再不需要的時候進行釋放。Riverpod 對於複雜且龐大的 APP 來說是一個不錯的選擇，它擁有其他狀態管理套件的能力，加上自己獨有的一些特色，包含強大的靈活性(但同時也是個雙面刃)，能夠讓開發者很輕鬆地進行開發。只要你熟悉了，Riverpod 絕對能有效地給予幫助。

## 延伸閱讀

- [Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？](https://ithelp.ithome.com.tw/articles/10333398)
- [Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！](https://ithelp.ithome.com.tw/articles/10333935)
- [Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？](https://ithelp.ithome.com.tw/articles/10334626)

## Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？

- 發布時間：2023-10-03 16:18:11
- 原文連結：<https://ithelp.ithome.com.tw/articles/10333398>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 18 篇

![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687L7DvMDwk4S.png)

當我們在專案使用 Riverpod 後， 一定很長使用到 WidgetRef API，例如：`ref.read()`、`ref.watch()`、`ref.listen()`，這些都是很便利的方法。而在熟悉後可能會有點好奇到底內部是如何運作的，以本文的主題 watch()，它是如何在元件裡監聽 Provider 並在狀態更新時即時 rebuild 刷新元件，做到 Data Binding 這件事，很值得花一點時間了解整個過程。

------------------------------------------------------------------------

當我們在 ConsumerWidget 和 ConsumerStatefulWidget 上使用 `ref.watch()` 會發生什麼事？來看一下內部的運作流程：

1.  其中 target 為我們要存取的 Provider，實際上是 **ProviderListenable**。`_dependencies` 為當前 context 所依賴的 Provider 資訊，是一個 Key 為 **ProviderListenable**，Value 為 **ProviderSubscription** 的 Map
2.  如果沒有依賴這個 Provider，就執行 ProviderContainer 的 `listen()`，負責在 Provider 有更新時呼叫 `markNeedsBuild()` 進行 Widget Tree 的重建。並返回 **ProviderSubscription** 物件
3.  如果前面檢查已經有 **ProviderSubscription**，那就直接返回，不需要再創建  
    ![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687IzT6BkScFD.png)  
    ![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687YUpeEB7Hzq.png)

看到 **ProviderElementBase** 的 `listen()` 方法，參數為要監聽的 Provider，還有一個 `listener` callback ，附帶參數為新舊狀態 。而其中的 `fireImmediately` 代表是否要再監聽開始的時候觸發一次 callback。

1.  一開始先檢查一些狀態、情境是否沒有問題。在大部分的 WidgetRef api 裡都會使用 `_assertNotOutdated()`，主要確認 didChangeDependency 是否為 true，意思是如果再 Provider 更新後但是 Widget 還沒重建之前，短時間無法執行 ref functions  
    ![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687Kp1Sz7g9CH.png)

2.  第二個檢查為 `_debugAssertCanDependOn()`，首先需要確保 Provider 本身已經初始化。接著將每個依賴者的 Element 拿出來，確認 `origin` 來源跟現在要監聽的 **ProviderListenable** 不同，否則就像自己依賴和監聽自己，會導致輪迴得狀況，所以拋出 **CircularDependencyError** 錯誤。

> 實際的例子就是 Provider A 依賴 Provider B，但是 B 又依賴了 A，在實際開發中如果沒有搞清楚互動流程，很容易會看這個錯誤發生。

![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687uv3n1SrHHa.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687ndA8WDnIX7.png)

經過檢查沒問題後，執行 `addListener()` ，至時候要看到 **ProviderBase**

1.  一樣先使用 `readProviderElement()` 確保 Provider 已初始化
2.  檢查 `fireImmediately` 參數是否為 true，是的話就透過 `handleFireImmediately()` 觸發 listener callback，通知一次
3.  接著執行 `_listenElement()`，這裡的 node 代表 **ProviderContainer**  
    ![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687purPIhgdbB.png)

到 **ProviderContainer**，使用參數創建了 **ProviderSubscription**，添加到此 Element 的 `_externalDependents` 依賴者集合，也就是 Widget，等待資料更新後要拿它來使用，並觸發元件刷新  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687EleNmJWvt2.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687koHEcKhI6y.png)

到這裡我們已經從 WidgetRef 的 `watch()` 和 `listen()` 操作了解到 **ProviderSubscription** 是什麼，接下來當 Provider 更新時就會使用它來通知相關的依賴者也就是元件。

------------------------------------------------------------------------

當元件 `watch()` 的 Provider 有狀態更新的時後就會出發 Element 裡的 `flush()` 方法，並進行 `_performBuild()`，大部分要刷新的操作都會經過 `flush()`，並檢查 `_mustRecomputeState` 是否為 true。這裡的 Element 為 **ProviderElementBase**  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687Ejq62FzjwH.png)

1.  接著到 `_notifyListeners()`，檢查狀態以及 `updateShouldNotify()` 確認是否要進行通知
2.  `_externalDependents` 前面有說過，它就是有使用 `ref.watch()` 的 Widget，也是依賴者，這裡是 `listeners` 集合。當有新的狀態時，通知他們要進行 rebuild。
3.  `subscribers` 是在 Provider 裡進行 `ref.watch()` 的依賴者  
    ![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687rj9R1yRhtF.png)

重建前的一段過程，到了 **InheritedNotifierElement**，執行 `update()` 以及 `build()`，最後到達 **ConsumerStatefulElement** 的 `build()` 方法，呼叫 `super.build()`，也就是我們熟悉元件上 State 的 `build()`。不管是使用 ConsumerWidget 還是 ConsumerStatefulWidget 背後都是一樣的流程。  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687UVWnzGDUBl.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687GlIoyuJFwl.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687BNKZWhaLUx.png)

最終元件的 `build()` 就被觸發了。  
![](https://ithelp.ithome.com.tw/upload/images/20231003/20120687WnWPVaPrIi.png)

------------------------------------------------------------------------

## 總結

到這裡有更熟悉 `ref.watch()` 嗎？建議有時間的話都可以將完整源碼看過，本文只是重點處分享，稍微講解一下，讓大家對它更有感覺。看源碼的過程我覺得很有趣，不需要急，看不懂沒關係，一步一步去了解實作方式，慢慢地就會知道日常的一些操作原理，讓自己往後在開發上能更清楚自己在做什麼。有機會的話更能貢獻一些你喜歡的開源專案，幫助自己也幫助社群。

## 延伸閱讀

- [Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色](https://ithelp.ithome.com.tw/articles/10332717)
- [Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！](https://ithelp.ithome.com.tw/articles/10333935)
- [Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？](https://ithelp.ithome.com.tw/articles/10334626)

## Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！

- 發布時間：2023-10-04 07:34:27
- 原文連結：<https://ithelp.ithome.com.tw/articles/10333935>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 19 篇

![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687WHgv6JnSGx.png)

本文進入測試環節。適合對 Riverpod 有實際玩過且熟悉的朋友們，不會特別講解相關開發技巧，我們著重在於如何寫好一個基本的測試，穩固專案的品質。希望由這些範例讓大家更有感，對寫測試不害怕而且喜歡，相信對於自己的專案會有所幫助。

過程中會使用到 **Mocktail** 套件，一個 Dart 的測試模擬工具，由 Bloc 作者 **Felix Angelov** 製作。Mocktail 提供很多簡單使用的 API，讓我們可以輕鬆偽造動作與資料，不需要自己撰寫 Mock Data 或是 Codegen 生成 (就像 **mockito** 套件)。

------------------------------------------------------------------------

## 前置說明

#### ProviderListener

在驗證測試的過程中我們會需要 ProviderSubscription 的 `listen()` 函式，負責監聽 Provider 的狀態變化，利於在測試裡檢查狀態的更新，是否跟我們邏輯流程裡期望的結果一樣。

而在開始之前，首先需要自定義一個 **ProviderListener**，它負責 `listen()` 函式裡的 callback，包含兩個參數，第一個為上一個狀態，第二個為新的狀態。驗證的過程都可以透過它知道 callback 被呼叫幾次，以及狀態是否符合期望。

``` dart
// Mock listener
class ProviderListener<T> extends Mock {
  void call(T? previous, T? next);
}
```

以下是後面會看到的實際範例，由 **listener** 進行驗證

``` dart
// Use Container to listen specific Provider status
providerContainer.listen( 
 testAppThemeModeProvider, 
 listener, 
 fireImmediately: true, 
);
```

#### **FutureProvider**

- 狀態是 AsyncValue，包含 **AsyncLoading**、**AsyncData**、**AsyncError**

#### **AsyncNotifierProvider**

- 狀態是 AsyncValue，包含 **AsyncLoading**、**AsyncData**、**AsyncError**
- `build()` → 負責初始化，允許進行非同步操作，返回 **FutureOr** 型別資料

------------------------------------------------------------------------

## Example 1 (FutureProvider)

### 情境

從本地儲存取得 APP 上次保存的 ThemeMode，透過它可以知道裝置為 light 還是 dark  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687rX9lOpUQt0.png)

### **實作**

首先在每個測試執行前初始化一些物件，進行前置作業。需要 **ProviderContainer** 存取每個 Provider、每個狀態，接著因為此測試要取得本地儲存的資料，需要偽造使用到的 LocalStorage，透過 overrides 覆蓋為 **MockLocalStorage**，準備測試使用。  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ve4TaDEvYr.png)

`makeProviderContainer()` → 方便在初始化時使用，只需給予要偽造的 Provider，以及在測試結束後釋放資源

``` dart
ProviderContainer makeProviderContainer({required List<Override> overrides}) {
    final container = ProviderContainer(overrides: overrides);
    addTearDown(container.dispose);

    return container;
}
```

當使用 `storage.get()` 的時候我想要它返回指定資料，這邊設置為 **true**  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687qwfRV2AU7M.png)

創建一個 Listener，資料類型為 Provider 提供的資料，透過 container 監聽此狀態，利於我們檢查狀態的更新  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ii9bxrJu28.png)

此測試的主角 appThemeModeProvider 本身是 FutureProvider，在還沒完成之前的狀態都是 null 到 Loading，透過 `verify()` 和 `expect()` 進行初步確認

1.  `verify()` 用來驗證狀態的更新

2.  `expect()` 用來檢查目前的 Provider 狀態，跟我們期望是否相同  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687noBbEbzTuE.png)

3.  完成非同步操作，從 MockLocalStorage 取得資料並返回 ThemeMode

4.  驗證 Provider 狀態，從 AsyncLoading 到 AsyncData，並取得 `ThemeMode.light`，因為前面 Mock 的時候我們希望能拿到 true

5.  期望 Provider 狀態，目前的狀態是 AsyncData，內容為 `ThemeMode.light`  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687efZ49T0Bt6.png)

最後驗證 Listener 是不是沒有狀態的更新了，而且存取 LocalStorage 的操作只有一次  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687vGuWXwZR9k.png)

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/201206873Po7NVGf2x.png)

以下為範例程式碼：

``` dart
test(
'Get ThemeMode(light) of APP',
    () async {
    /// arrange
    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) => Future.value('true'));

    /// run
    final listener = ProviderListener<AsyncValue<ThemeMode>>();
    providerContainer.listen(
      appThemeModeProvider,
      listener,
      fireImmediately: true,
    );

    // Check state before completing future
    // 1. by verify
    verify(() => listener(null, const AsyncLoading<ThemeMode>()));
    // 2. by expect
    expect(providerContainer.read(appThemeModeProvider), const AsyncLoading<ThemeMode>());

    // Finish the future operation
    await providerContainer.read(appThemeModeProvider.future);

    // Check state when future completed.
    // 1.
    verify(
      () => listener(
        const AsyncLoading<ThemeMode>(),
        const AsyncData<ThemeMode>(ThemeMode.light),
      ),
    );
    // 2.
    expect(
      providerContainer.read(appThemeModeProvider),
      const AsyncData<ThemeMode>(ThemeMode.light),
    );

    // No new status
    verifyNoMoreInteractions(listener);

    // Only be called one time
    verify(() => storage.get(any())).called(1);
  },
);
```

## Example 2 (AsyncNotifierProvider)

### 情境

本範例一樣是從本地取得 APP 保存的 ThemeMode，不同的是，這裡使用 **AsyncNotifier** 在 `build()` 初始化時從本地取得 ThemeMode，並設置初始狀態。AppThemeModeNotifier 經由 `appThemeModeNotifierProvider` 提供  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687iqbg6dDM38.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687d5BXjUKKoS.png)

### 實作

通常一開始都是先使用 `when()` 和 `then()` 相關 API，進行操作的資料偽照。接著透過 `listen()` 進行 Provider 狀態的監聽  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687jSSe29CITg.png)

1.  首先驗證初始狀態，一樣是 null 到 **AsyncLoading**，並確認之後沒有新的狀態更新了
2.  因為 `appThemeModeNotifierProvider` 類型是 **AsyncNotifierProvider**，這邊使用 await future 等待初始化完成，再進行結果檢查，預期拿到的數值是 **ThemeMode.light**
3.  最後確認資料只有被存取過一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ezxrpy2PJa.png)

測試運行成功  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687an0wpCAfLs.png)

以下為範例程式碼：

``` dart
test(
  'initialize in build() and get ThemeMode.light',
  () async {
    /// arrange
        when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) async => 'true');
    
        /// run
    final listener = ProviderListener<AsyncValue<ThemeMode>>();

    // Listen testAppThemeModeProvider to check status later.
    providerContainer.listen(
      appThemeModeNotifierProvider,
      listener,
      fireImmediately: true,
    );

    // In the beginning, always from null data to Loading state.
    verify(() => listener(null, const AsyncLoading()));
    verifyNoMoreInteractions(listener);

    // Complete build() of AsyncNotifier.
    // Need to use expectLater() to check current state.
    await expectLater(await providerContainer.read(appThemeModeNotifierProvider.notifier).future, ThemeMode.light);

    // Try to get local data from local storage in build().
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
  },
);
```

## Example 3 (AsyncNotifierProvider and Exception)

### 情境

新增 `toggleMode()` 目的為切換 App 的 ThemeMode，驗證過程中在拋出例外後的狀態更新與流程是否正常  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687gl9HodyZlo.png)

### 實作

在測試一開始先安排資料預期的輸出，在存取本地資料的時候希望拋出例外  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687BcBiSQBPZz.png)

當 `listen()` 指定 Provider 狀態的時候，就開始進行 `build()` 的初始化，這時候會去存取 LocalStorage，所以先檢查是否已經呼叫一次  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ZXBIFsVb7E.png)

當存取 LocalStorage 的時候，期望獲得一個例外，可以使用 `throwA(isA<Exception>())`  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687pqfGpdDXFb.png)

檢查兩個狀態更新

1.  第一個情境，在取得目前的 ThemeMode 之前會先更新為 **AsyncLoading** 狀態
2.  第二個情境，從 AsyncLoading 準備取得資料，這時候存取資料會拋出例外，是我們安排的情況，Provider 狀態會更新成有錯誤。錯誤的檢查方式使用 `predicate()`，確認其中 AsyncValue 是否有錯誤，有的話才符合我們要的流程
3.  最後確認資料只有被存取過一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687D3XJtGqbrk.png)

也可以用另外一種方式，檢查狀態型別是否正確

``` dart
() => listener(
    const AsyncLoading(),
    any(
        that: isA<AsyncError<ThemeMode>>(),
    ),
),
```

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687kx5WwwrogO.png)

以下為範例程式碼：

``` dart
test(
  'call toggleMode() but throw exception.',
  () async {
    /// arrange

    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenThrow(Exception('Can not get theme!'));
    when(() => storage.set(LocalStorageKeys.isLightTheme, any<bool>())).thenAnswer((invocation) => Future.value());

    /// run

    final listener = ProviderListener<AsyncValue<ThemeMode>>();
    providerContainer.listen(
      appThemeModeNotifierProvider,
      listener,
      fireImmediately: true,
    );

    // When listen the provider, it will initialize and run build()
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);

    await expectLater(() async => providerContainer.read(appThemeModeNotifierProvider.notifier).toggleMode(), throwsA(isA<Exception>()));

    verifyInOrder([
      // Beginning set the loading state
      () => listener(null, const AsyncLoading()),
      // Error will appear when complete
      () => listener(
            const AsyncLoading(),
            any(
              that: predicate<AsyncValue<void>>(
                (value) {
                  expect(value.hasError, true);

                  return true;
                },
              ),
            ),
          ),
    ]);

    // Call storage.get() again
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
    
  },
);
```

## Example 4 (AsyncNotifierProvider and Stream)

### 情境

在初始 `build()` 和 `toggleMode()` 進行 **Stream** 更新，取得目前的 ThemeMode，檢查狀態是否有按照期望的流程更新  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687B4xBsLt0JT.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687s1MfObf2jv.png)

### 實作

依正常流程來說此範例會存取本地資料 3 次，進行呼叫的次數驗證

1.  因為 Notifier 初始化的關係，一開始在 `build()` 裡存取資料，取得目前設定的 ThemeMode

2.  第二次是在呼叫 `toggleMode()` 時，一開始也會取得資料

3.  第三次則是再更新 ThemeMode 後，刷新 `appThemeModeProvider`，一樣需要存取本地資料。實際上是否要有這個 Provider 狀態還是根據實際開發需求，這裡只是做個範例展示  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687GuqsnFT4CV.png)

4.  檢查 Stream 資料流，我們期望它能照流程給予狀態。先是原本的 ThemeMode.light，再來點擊切換樣式後，更新成 ThemeMode.dark

5.  最後再次驗證 storage 被存取的次數，在這邊為一次  
    ![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687JYizdeB1Ya.png)

測試運行成功！  
![](https://ithelp.ithome.com.tw/upload/images/20231004/20120687ZJ2wkcVghg.png)

以下為範例程式碼：

``` dart
test(
  'call toggleMode() and check stream data is correct',
  () async {
    /// arrange
    when(() => storage.get(LocalStorageKeys.isLightTheme)).thenAnswer((_) async => Future.value('true'));
    when(() => storage.set(LocalStorageKeys.isLightTheme, any<bool>())).thenAnswer((invocation) => Future.value());

    /// run
    await providerContainer.read(appThemeModeNotifierProvider.notifier).toggleMode();

    // call once in build()
    // call once in toggleMode()
    // call once in appThemeModeProvider
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(3);

    expect(
      providerContainer.read(appThemeModeNotifierProvider.notifier).currentModeStream,
      emitsInOrder(
        const [
          ThemeMode.light,
          ThemeMode.dark,
        ],
      ),
    );

    // call once in build()
    verify(() => storage.get(LocalStorageKeys.isLightTheme)).called(1);
    
  },
);
```

注意：如果是使用 `expectLater()` 來檢查結果的話需要先在操作前定義好，等待操作後的結果，這樣寫測試比較不自然。建議用 `expect()`，可以在操作後進行檢查

------------------------------------------------------------------------

## Tips

- **盡可能的給予泛型**，將型別描述出來，方便閱讀以及查找問題
- 無法確保實際值的時候使用 `any()` 幫助檢查
- 使用 **ProviderSubscription** 搭配自訂義的 **ProviderListener**，監聽 Provider 狀態變化，方便檢查
- 每個測試可以新增自定義的 `timeout` 參數，確保我們的測試在需要時**快速失敗**，不會卡住流程

將一些重複的操作優化成 Extension API，除了方便外，穩定性、可度性都能提高。

``` dart
/// For flutter_test
extension FinderMatchExtension on Finder {
    void never() => expect(this, findsNothing);
    void once() => expect(this, findsOneWidget);
    void times(int number) => expect(this, findsNWidgets(number));
    void some() => expect(this, findsWidgets);
}

/// For mocktail
extension VerificationCalledExtension on VerificationResult {
    void never() => called(0);
    void once() => called(1);
    void twice() => called(2);
    void threeTimes() => called(3);
    void times(int number) => called(number);
}
```

## Problem

在使用 `any()` 或 `captureAny()` 時可能會出現的錯誤

``` bash
Bad state: A test tried to use `any` or `captureAny` on a parameter of type `AsyncValue<void>`, but
registerFallbackValue was not previously called to register a fallback value for `AsyncValue<void>`.
```

需要 `registerFallbackValue()`，否則無法作為值分配給不可為 null 的參數。如果此型別在很多測試裡都會使用到，可以在所有測試執行前進行設置

``` dart
setUpAll(() {
    registerFallbackValue(const AsyncLoading<void>());
});
```

------------------------------------------------------------------------

## 總結

到這裡大家覺得測試好玩嗎？有沒有接受並開始懂的如何寫了呢？其實，不管自己和公司專案有沒有在寫測試，或是有 QA 在幫忙，都應該要重視這一塊。當我們針對邏輯、操作流程、元件做了一層保護，開發、維護上也會更有保障，不是靠其他人驗證就沒問題，我們也不用提心吊膽的進行改版更新。應該讓自己慢慢養成寫測試的習慣，如何在時間與需求的壓力下讓專案趨近於完整和高品質，一直是開發者的課題。

也期許未來能夠看到更多有關測試的經驗談，之後也會在撰寫另一篇有關測試技巧的內容，歡迎大家提出來討論，分享踩坑紀錄，我想應該蠻有趣的！

[Github](https://github.com/chyiiiiiiiiiiii/test_riverpod_with_mocktail?source=post_page-----d67cedbb2722--------------------------------)

------------------------------------------------------------------------

## 延伸閱讀

- [Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色](https://ithelp.ithome.com.tw/articles/10332717)
- [Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？](https://ithelp.ithome.com.tw/articles/10333398)
- [Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？](https://ithelp.ithome.com.tw/articles/10334626)

## Day 20: Riverpod 的開發多元性以及日常使用技巧！Provider 該如何選擇？

- 發布時間：2023-10-05 14:40:07
- 原文連結：<https://ithelp.ithome.com.tw/articles/10334626>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 20 篇

![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687ljLfmVOv4I.png)

Riverpod 是什麼？相信大家都已經有初步了解了，甚至大家都已經運用在自己的專案了對吧？它本身的使用方式很多樣，是個很靈活的框架，但在很方便開發的同時，也很容易造成多成員開發方式不同的問題，所以需要有規範去執行，不管是個人還是團隊都一樣，如果本身對專案與程式碼品質有要求的話，相信大家都是對自己很有要求的開發者。

本文要講解幾種 Riverpod 的日常使用，在同一個需求情境下，其實有多種能完成的方式，如何做正確選擇，需要等你們實際玩過才會得知。另外，也會分享一些開發技巧，希望能夠有效的提升開發效率，進而讓我們喜歡使用 Riverpod。話不多說，馬上開始吧

------------------------------------------------------------------------

假設今天我們要請求 API 取得 User 資料，會如何使用？其實用 **Provider**、**FutureProvider**、**Notifier**、**AsyncNotifier** 等等都可以實作，差別就是根據操作情境來選擇，以下一起來看看每個 Provider 使用的差異性。

## 1. Provider

使用基本的 Provider 來處理非同步操作。以範例來看，實際上 Provider 可以執行非同步任務，使用 async 將資料回傳。

``` dart
final userProvider = Provider((ref) async {
    return ref.watch(userRepositoryProvider).getUser();
});
```

所以外部可以直接 await `ref.read()` ，就跟我們使用一般的 async method 一樣。不同的是，使用 Provider 同時也會將第一次的結果狀態緩存起來，也就是說，當第二次第三次存取 **userProvider** 的時候，會回傳剛剛處理的結果，不會在執行新的請求。

``` dart
final user = await ref.read(userProvider);
debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

這時候可能有人會問，可以每次存取的時候都重新請求嗎？當然可以，不過需要額外的釋放操作，也就是使用 `invalidate()`，使指定 Provider 無效，將緩存的狀態丟掉，同時 Provider 也被釋放了，在下次存取時就會重頭來過。

``` dart
final user = await ref.read(userProvider);
ref.invalidate(userProvider);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

當然我們也可以使用 `ref.refresh()`，它跟 `invalidate()` 差異就是直接重新來過並且回傳結果，其實過程就是先執行釋放接著再存取一次，算是個更便捷的 API。

``` dart
final user = await ref.refresh(userProvider);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

`refresh()` 就相當於先 `invalidate()` 在 `read()`，可以根據喜好還有情境去選擇。

``` dart
final user = await ref.refresh(userProvider);

==

ref.invalidate(userProvider);
final user = await ref.read(userProvider);
```

## 2. FutureProvider

使用 FutureProvider 請求 User 資料。大家應該知道會傳的結果都是 AsyncValue，因為是非同步就會有載入中、成功和錯誤三種狀態，所以大家常用的情境是跟 UI 綁在一起，根據狀態來顯示對應的元件。透過 `ref.watch()` 監聽狀態的方式，我們可以這樣實作

``` dart
final userProvider = FutureProvider.autoDispose((ref) async {
    return ref.watch(userRepositoryProvider).getUser();
});

// In UI
ref.watch(userProvider).when(
    data: (User data) {
        return Text(data.name);
    },
    loading: () {
        return const CircularProgressIndicator();
    },
    error: (error, stacktrace) {
        return const Text('Oops!');
    },
)
```

> 範例中的 Provider 我都會使用 `autoDispose` modifier，它主要的功能就是當 Provider 沒有被使用被監聽的時候釋放掉，有效節省資源，避免忘記處理記憶體。在大部分的情境中，需要自動釋放的時刻會比較多，可以養成習慣。甚至如果使用 Riverpod 的 Codegen 寫法的話(本文不會講解)，預設 Provider 都是 `autoDispose`，所以開發起來就更方便。當然如果大家會自己管理釋放時機的話就不需要添加，一樣的受根據需求去做選擇。

這時候也許有人會問，我可以跟 Provider 或是一般非同步方法一樣，直接呼叫並取得結果嗎？當然可以。使用 Provider 擁有的 `future` 屬性，可以讓我們取得結果，同時將結果緩存起來，所以如果之後在存取 Provider 的時候，會回傳舊的資料。

``` dart
final user = await ref.read(userProvider.future);

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

## 3. NotifierProvider

使用 NotifierProvider 請求 User 資料。Notifier 不同的是初始化寫在 `build()`，我們可以在內部定義一些相關的方法來做額外的一些處理，可以存取狀態或是更新狀態，在此範例增加了兩個方法， `getUser()` 取得資料、 `updateUser()` 更新狀態為新的 User。

Notifier 本身是同步的，所以回傳值就是我們的 User，不過因為預設值的部分，在一開始我們還沒有請求資料所以預設為 null。接著再呼叫裡面寫好的方法 `getUser()`，等請求成功之後再進行狀態的更新，這時候畫面也會同時反應。

``` dart
final userProvider = NotifierProvider.autoDispose<UserNotifier, User?>(UserNotifier.new);

class UserNotifier extends AutoDisposeNotifier<User?> {
    @override
    User? build() {
        getUser();

        return null;
    }

    Future<User> getUser() async {
        final user = await ref.read(userRepositoryProvider).getUser();
        state = user;

        return user;
    }

    Future<void> updateUser(User user) async {
        state = user;
    }
}
```

在 UI Code，一開始的去讀取 **userProvider**，這時候就會觸發 Notifier 裡的 `build()` 並請求 User 資料。接著在使用 `watch()` 監聽狀態變化，等待更新後同步 rebuild。而在這裡因為狀態一開始預設為 null，所以如果點擊按鈕要更新的話，先檢查是否為 null，這裡透過 Dart3 的 If-Case Matching 幫忙檢查，有值我們才呼叫 `updateUser()` 去更新狀態。

``` dart
@override
void initState() {
  super.initState();

  ref.read(userProvider);
}

@override
Widget build(BuildContext context) {
    final user = ref.watch(userProvider);

    return Scaffold(
        body: Center(
            child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    Text(user?.name ?? ''),
                    ElevatedButton(
                        onPressed: () {
                            final newUser = user?.copyWith(id: 2, name: 'Jay');
                            if (newUser case final newUser?) {
                                ref.read(userProvider.notifier).updateUser(newUser);
                            }
                        },
                        child: const Text('Update User'),
                    ),
                ],
            ),
        ),
    );
}
```

![NotifierProvider](https://i.imgur.com/gJG2Skm.gif)

如果要前面的跟 Provider 一樣直接取得 User 呢？就可以把 Notifier 當作 Controller，透過裡面的 `getUser()` 直接取得資料。當然取得後 **userProvider** 裡的狀態也會被刷新。

``` dart
final user = await ref.read(userProvider.notifier).getUser();

debugPrint(user.toJson().toString());
// {id: 1, name: Yii Chen}
```

------------------------------------------------------------------------

## 4. AsyncNotifierProvider

使用 AsyncNotifierProvider 請求 User 資料。以範例來看，跟 Notifier 類似，只是它專門處理非同步狀態，狀態會被 AsyncValue 包裹，這樣的好處是當我們存取 Provider 時也會有 Loading 跟 Error 狀態可以處理，直接針對幾個狀態去顯示對應的 UI，不需要額外在自定義相關狀態。

``` dart
final userProvider = AsyncNotifierProvider.autoDispose<UserNotifier, User>(UserNotifier.new);

class UserNotifier extends AutoDisposeAsyncNotifier<User> {

    @override
    FutureOr<User> build() {
        return getUser();
    }

    Future<User> getUser() async {
        final user = await ref.read(userRepositoryProvider).getUser();

        return user;
    }

    void updateUser(User user) {
        update((data) => user);
    }

}
```

UI Code 的寫法都差不多，在這裡新增了一個按鈕，負責更新原本的 User 狀態。所以再點擊後，會呼叫 **UserNotifier** 的 `updateUser()`，將 User 設置給它，這時候畫面也同時響應、刷新。

``` dart
ref.watch(userProvider).when(
  data: (User data) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(data.name),
        ElevatedButton(
          onPressed: () {
            final newUser = data.copyWith(id: 2, name: 'Jay');
            ref.read(userProvider.notifier).updateUser(newUser);
          },
          child: const Text('Update User'),
        ),
      ],
    );
  },
  loading: () {
    return const CircularProgressIndicator();
  },
  error: (error, stacktrace) {
    return const Text('Oops!');
  },
)
```

![AsyncNotifierProvider](https://i.imgur.com/gJG2Skm.gif)

跟前面一樣，那 AsyncNotifierProvider 直接觸發非同步任務的方式呢？第一種方式透過 future，如果是第一次存取 Provider，就會初始化執行 `build()`，裡面會請求資料並緩存，而我們也可以拿到新的狀態回傳值。

``` dart
final user = await ref.read(userProvider.future);
```

第二種方式，跟 Notifier 一樣，直接呼叫 `getUser()` 取得最新資料，這樣的話就不會管緩存狀態，每次都會重新請求並取得結果。

``` dart
final user2 = await ref.read(userProvider.notifier).getUser();
```

## 選擇方向

到這裡我們已經觀察了四種 Provider 對於相同需求的撰寫方式，實際當然需要根據情境、邏輯、資料流等等去選擇，不過這邊可以順便給大家幾個方向：

- **Provider**
  1.  物件、服務提供者 → 讓很多情境、需求下都存取相同實體
  2.  資料反應者 → 負責監聽其他狀態，並提供處理後的緩存資料
- **FutureProvider**
  1.  非同步執行者 → 單純取得非同步結果，沒有其他額外對於狀態的操作，例如：API 的 Get 請求、讀取資料庫
- **Notifier**
  1.  邏輯與狀態的管理者 → 需要自定義某個需求、功能的狀態類，並透過其他操作控制狀態。例如：當成 feature 或 page 的 Controller、ViewModel、功能的集中處理地，當今天需要有載入或是錯誤的狀態，可以自定義，自行提供
- **AsyncNotifier**
  1.  跟 Notifier 一樣，只是需要在初始就取得非同步數據，並且大部分操作都有非同步狀態的支援，像是 **AsyncData**、**AsyncLoading**、**AsyncError**

## Example - 網路監聽

在 Flutter 開發，當我們需要檢查網路是否連接時，很常會使用 `connectivity_plus` 套件。以下整理了幾種檢查和存取網路狀態的方式，進而讓大家更了解 Riverpod 的靈活性。

### StreamProvider

使用 StreamProvider 創建一個 Stream，持續的給予最新狀態。

1.  首先創建 Connectivity 實體，並在一開始主動取得連線狀態，並 **yield** 新增第一個值給資料流
2.  接著持續監聽狀態變化，當有更新時新增狀態給資料流，使用 **yield**\*，處理

``` dart
final hasInternetStreamProvider = StreamProvider.autoDispose<bool>((ref) async* {
    final connectivity = Connectivity();

    yield (await connectivity.checkConnectivity()).hasInternet;
    yield* connectivity.onConnectivityChanged.map((result) => result.hasInternet);
});
```

完成 UI 畫面根據網路狀態反應的需求  
![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687g0dttbsKgJ.png)

``` dart
@override
Widget build(BuildContext context) {
    final hasInternet = ref.watch(hasInternetStreamProvider).value ?? false;

    return hasInternet ? const WelcomeInfoWidget() : const CircularProgressIndicator();
}
```

其中，看到 ConnectivityResult 有一個 `hasInternet` getter，它是自定義的 Extension api，方便後續的實作，方便快速。

``` dart
extension ConnectivityResultExtension on ConnectivityResult {
    bool get hasInternet => switch (this) {
        ConnectivityResult.mobile || ConnectivityResult.wifi => true,
        _ => false,
      };
}
```

### StreamProvider - part2

另一種寫法，使用自己的 StreamController 來管理資料流。

1.  首先這裡順便把 Connectivity 物件獨立出來，讓其他 Provider 共同存取它

``` dart
final connectivityProvider = Provider<Connectivity>((ref) {
    return Connectivity();
});
```

2.  使用 StreamProvider 搭上 `autoDispose()`，在 Provider 沒有使用時被釋放、銷毀
3.  首先取得 connectivity 實體，並創建一個 StreamController，負責處理資料
4.  跟前面範例一樣，先取得當前狀態並添加到 Stream，讓監聽者可以被通知
5.  接著在 `onConnectivityChanged()` callback 等待資料更新，添加狀態給 Stream，讓外部監聽著收到通知，做後續處理與反應
6.  最後關鍵點，需要在 `onDispose()` 將資源釋放

``` dart
final hasInternetStreamProvider = StreamProvider.autoDispose<bool>((ref) async* {
    final connectivity = ref.watch(connectivityProvider);
    final streamController = StreamController<bool>();

    final currentStatus = (await connectivity.checkConnectivity()).hasInternet;
    streamController.add(currentStatus);

    final subscription = connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
        switch (result) {
            case ConnectivityResult.mobile || ConnectivityResult.wifi:
                streamController.add(true);
            case _:
                streamController.add(false);
        }
    });

    ref.onDispose(() {
        subscription.cancel();
        streamController.close();
    });

    yield* streamController.stream;
});
```

UI 的寫法都一樣，根據狀態顯示元件  
![](https://ithelp.ithome.com.tw/upload/images/20231005/20120687tUOarnT7W0.png)

### NotifierProvider

使用 NotifierProvider 實作，方便將每個操作切分開來，實作過程都差不多。

1.  在 `build()` 給予初始值 false，因為還沒監聽到狀態變化
2.  執行 `initConnectivity()`，持續等待狀態更新，有新的狀態就觸發 `onStateDetected()` 更改當前的緩存數據
3.  最後在 `onDispose()` 釋放資源，結束 **streamSubscription** 物件

``` dart
final hasInternetNotifierProvider =
    NotifierProvider.autoDispose<InternetStatusNotifier, bool>(InternetStatusNotifier.new);

class InternetStatusNotifier extends AutoDisposeNotifier<bool> {
    StreamSubscription<ConnectivityResult>? _streamSubscription;

    @override
    bool build() {
        initConnectivity();
        onDispose();

        return false;
    }

    void initConnectivity() {
        _streamSubscription = Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
        bool newState = false;

        switch (result) {
            case ConnectivityResult.mobile || ConnectivityResult.wifi:
                newState = true;
            case _:
                newState = false;
        }

        onStateDetected(newState: newState);
        });
    }

    void onStateDetected({required bool newState}) {
        if (state != newState) {
            state = newState;
        }
    }

    void onDispose() {
        ref.onDispose(() {
            _streamSubscription?.cancel();
            _streamSubscription = null;
        });
    }
}
```

UI Code 的部分跟 StreamProvider 不同，狀態不是 AsyncValue，可以直接拿來使用。

``` dart
@override
Widget build(BuildContext context) {
    final hasInternet = ref.watch(hasInternetNotifierProvider);

    return hasInternet ? const WelcomeInfoWidget() : const CircularProgressIndicator();
}
```

> 其實此範例應該使用 AsyncNotifier 處理，因為一開始沒有取得當前狀態，透過 `checkConnectivity()` 的非同步操作取得，把它當成初始值。大家可以思考自己的需求，或是嘗試進行修改，過程會更熟悉更有趣。

## 分享一個開發技巧

在本文快結束的地方，順便分享一個好用的 UI 開發技巧，自定義 Extension Api 來協助我們。有經驗的朋友們應該知道 AsyncValue 是什麼，以及它的方便性，透過三種狀態來顯示指定元件。

當在 UI 處理了很多個 AsyncValue 後應該會發現有一些重複的程式碼，像是普遍 loading 跟 error 狀態都是相同的處理程序，這時候就可以將它們賦予預設動作，有效簡化開發。

範例：

1.  撰寫自定義的 `simpleWhen()`，在 **loading** 和 **error** 狀態設置預設的顯示元件，也包含其他 APP 預期的非同步操作
2.  每次主要處理都是在 **data** 成功狀態，可以根據資料給予預設值， 像這裡就是如果遇到空資料就顯示特定文字，固定呈現方式，確保一致性
3.  正常情況下只需要在呼叫時給予 `data()` callback 就完成 UI code，非常的簡潔、快速，省時又省力

``` dart
extension AsyncValueExtension<T> on AsyncValue<T> {

    Widget simpleWhen({
        required Widget Function(T data) data,
        Widget? empty,
        bool skipLoadingOnReload = false,
        bool skipLoadingOnRefresh = false,
        bool skipError = false,
    }) =>
        when(
            data: (tempData) {
                if (tempData is List) {
                    return tempData.isNotEmpty ? data(tempData) : Center(child: empty ?? const Text('目前沒有資料哦'));
                }

                return data(tempData);
            },
            loading: MyLoading.new,
            error: (error, stackTrace) => MyError(),
            skipLoadingOnReload: skipLoadingOnReload,
            skipLoadingOnRefresh: skipLoadingOnRefresh,
            skipError: skipError,
        );

}
```

------------------------------------------------------------------------

## 總結

到這裡應該篇幅稍長，最主要是想分享一些使用 Riverpod 的想法，它的靈活性很大，根據需求有各種實作方式，希望能讓大家更快的解決問題，並懂得如果操作每個 Provider 來幫助專案開發。Riverpod 本身很強大，但也很容易有自己的寫法，造成專案資料流的混亂，不像 Bloc 狀態管理有嚴謹的流程與限制，團隊這時候就需要統一規範，每個情境的開發想法才會一致，確保專案品質的標準。

最後，大家對於 Riverpod 開發技巧有興趣嗎？如何高效使用它，這個部分會再發佈另一篇文章來說明，大家可以期待一下！

------------------------------------------------------------------------

## 延伸閱讀

- [Day 17: Riverpod 是什麼？它負責狀態管理嗎？跟著我了解幾個重要角色](https://ithelp.ithome.com.tw/articles/10332717)
- [Day 18: Flutter 狀態管理？Riverpod 的 watch() 實際上如何通知更新？](https://ithelp.ithome.com.tw/articles/10333398)
- [Day 19: 如何撰寫 Riverpod 測試，使用 Mocktail 來幫助我們吧！](https://ithelp.ithome.com.tw/articles/10333935)

## Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)

- 發布時間：2023-10-06 16:03:56
- 原文連結：<https://ithelp.ithome.com.tw/articles/10335311>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 21 篇

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687IhJZ0LeTy3.png)

大家對於 DevTools 還熟悉嗎？專屬於 Flutter 的 Debugging 工具，本身也是使用 Flutter 進行開發，以這工具來看，就可以知道 Flutter 淺力了對吧，順暢表現當然沒問題。不過這是題外話，就我的觀察與了解，大部分開發者不太熟悉它，很多人比較常用 Inspector，查看排版佈局以及定位元件，其他很多功能都沒在使用，但它們卻非常重要也很有價值。

本文就是要帶大家了解 DevTools，逐步說明 Flutter Inspector 以及 Performance 工具，如何幫助我們開發以及優化產品，附上非常多的實際操作流程以及範例，希望讓大家更有感覺，並開始擁抱和喜歡使用它們。

## 何謂 APP 的順暢表現？

APP 的每一幀創建和渲染在各別的線程上運行，分別是 UI Thread 和 Raster Thread，如果要避免延遲，需在16毫秒或更短的時間內創建、處理並顯示一幀，才能期望一秒達成 60 幀。如果發現 APP 總渲染時間低於16毫秒，即使存在一些效能缺陷，也不必擔心，因為可能不會產生視覺差異，比較難感受出來。隨著近幾年 120fps 設備的普及，就需要8毫秒內完成渲染流程，以提供最流暢的體驗，而在順暢的運行下也可以有效改善電池壽命和散熱問題。

在 Flutter 裡，官方提供了 DevTools 工具協助我們開發，那什麼情境下需要使用工具來優化 APP 呢？

- 畫面幀數偏低
- 操作卡頓
- 圖片載入緩慢
- 記憶體使用過多
- 網路請求等待時間長
- APP 體積過大，不理想
- 電量消耗速度快
- 啟動時間過長

其中幾點情況你的 APP 有遇到嗎？有的話是不是要考慮優化專案了？我們趕緊往下邊閱讀邊操作吧！

------------------------------------------------------------------------

## 專案的運行模式

在學會使用工具之前，需要先了解 Flutter 幾種專案的運行模式，每個模式適合的情境都不同

### Dev

- 使用 Dart JIT Compiler
- `適合開發階段`
- 支援設備和模擬器
- 可以使用 Hot reload
- 可以插入 Breakpoints
- 適合使用 DevTools 處理佈局排版、尋找元件
- 沒有壓縮資源檔案，也沒有做性能優化，導致 APP 體積大，而運行上會比實際還要卡頓，如果要做效能調校是建議在 Profile mode

``` dart
flutter run --debug

# flavor
flutter run --debug --flavor dev --target ./lib/main_dev.dart
```

### Profile

- 使用 Dart AOT Compiler
- `適合分析性能、效能調教`
- 只支援設備
- 適合使用 DevTools 進行性能表現的檢測，適合查看 Performance、CPU、Memory
- 沒有壓縮資源檔案，但整體性能有優化，可以實現接近 Release mode 的性能

``` dart
flutter run --profile
```

### Release

- 使用 Dart AOT Compiler
- `適合正式產品`
- 只支援設備
- 使用 `tree-shaking` 壓縮資源檔案，實現運行時的效能最優化。因此，APP容量最小，可以快速啟動、處理運算

``` dart
flutter run --release
```

## 影響性能的兩個關鍵因素

### Time

- UI 和 Raster 花的時間過長，渲染畫面需要每一幀 16ms 內完成才能保證順暢，確保一秒60幀
- 當有某一幀超過 16ms，代表會佔用或跳過下一幀的圖像，導致卡頓的情況發生

### Space

- 記憶體佔用過多、創建太多無意義實體、保存了不需要的記憶體
- 內存泄露。通常是沒有正常的管理資源，在對的時間點關閉服務、釋放資源

## DevTools

- 官方用 Flutter 開發的可視化檢測工具，目前使用全新的 **Material 3** 設計風格，以圓弧為重點，視覺上舒服
- 包含許多功能，包含程式碼檢測、佈局瀏覽、CPU檢查、渲染性能檢查、記憶體檢查、網路檢查、體積分析
- 可以輕鬆了解用戶體驗，例如：卡頓狀況、頁面載入速度或響應時間  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687E9YHAwN9DX.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687VzgVYA5dHB.png)

### 使用 DevTools 分析性能

#### 檢測

1.  找出影響最大的原因，清楚了解哪些 UI、操作表現良好，哪些部分表現不佳
2.  專注於性能較差的地方，從中量化影響，比較改動之前後，確認優化結果，在有限時間內取得最大的改善

#### 優先處理

1.  使用者花費最多時間
2.  對使用者來說影響最大的

------------------------------------------------------------------------

## Flutter Inspector

- 負責檢查 UI 排版、診斷佈局問題
- 完整瀏覽 APP WidgetTree，目前畫面上的排版架構與層級，一目了然
- 當 UI 有問題時錯誤會直接提醒，點擊元件即可查看詳細資訊  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687Yr0a81ktjG.png)

### Layout Explorer

- 佈局管理器
- 查看元件與元件之前的排版資訊，包含設置的屬性，例如：長寬大小、主軸配置、次軸配置、最小與最大約束
- 可直接調整元件的屬性配置，調整後裝置也會即時更新UI，不用從程式碼上修改，能更快地確定排版跟效果，節省很多時間  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687d79fa0UDF3.png)  
  ![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687gh2W63Cjof.png)

以下範例，我針對 Column 做了調整，動了 DecoratedBox 和 AppGap 兩個元件的配置，當我調整後，右邊的 UI 也即時更新，可以再確認效果後再去改程式碼就好。  
![Layout Explorer](https://i.imgur.com/xqgrd2a.gif)

### Widget Details Tree

- 瀏覽架構、元件資訊，包含所有的屬性狀態

![Widget Details Tree](https://i.imgur.com/YYH3ZDF.gif)

### Select Widget Mode

- 元件選擇模式
- 支援點擊畫面上的元件，IDE 會直接跳轉到對應的元件程式碼，而當我們有打開 Flutter Inspector，Widget Tree、Layout Explorer、Details Tree 都會進行跳轉。但是如果 Widget Tree 剛好很多層元件很深的話，就會變的比較難找到，可能會需要嘗試點擊好幾次

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687bRmYEOFbre.png)  
![Select Widget Mode](https://i.imgur.com/JFzx652.gif)

### Show guidelines

- 顯示渲染框，方便了解元件的對齊風格、填充大小、剪裁

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687U9fXNH5F5n.png)

### Show baselines

- 單純檢查文字的對齊狀況

![](https://ithelp.ithome.com.tw/upload/images/20231006/201206876yqOEqFK77.png)

### Highlight Repaints

顯示渲染框，根據元件的重繪次數顯示不一樣的顏色，註記那些會頻繁重繪的範圍。在每次重繪時有刷新的元件線條顏色會一直變換，如果此時有看到不應該重繪的元件頻繁更新顏色，就代表程式碼需要優化，嚴重的話會影響 APP 效能表現。

以下方範例來看，點擊的選項顏色與外框都會比較突出，所以選擇後會根據狀態更新新舊兩個元件，這時候會看到有兩個元件的外框顏色在變化，其他不相關的部分會保持原本顏色，也代表沒有無意義更新。

![Highlight Repaints](https://i.imgur.com/hiywSFR.gif)

如果不想開啟 DevTools 也可以在主函式 `main()` 設置 **debugRepaintRainbowEnabled** 為 true，需要匯入 `rendering.dart`。

``` dart
debugRepaintRainbowEnabled = false;
```

### Highlight Oversized Images

標示大型圖像，通過顏色反轉和顛倒來標示體積過大、使用大量記憶體的圖像。不管是本地圖像還是雲端圖像都可以檢測。如果有使用到很長的 ScrollView，當大量大體積圖像載入時，可能會有效能表現的影響。

多大的體積，會被標記為大型圖像呢？超出 **debugImageOverheadAllowance** 設置大小，預設為**128kb**  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687UQ5fJhLRyG.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687jfb9AUbaaE.png)

當發現大型圖像時 Console 也會看到 Painting Exception。以下範例顯示，元件實際的寬長為 852×563 但是卻解析了 1179×786 尺寸的圖像，同時也給予了建議，可以設置 **cacheWidth**、**cacheHeight**，或是使用 **ResizeImage** 優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/201206876hyyEKmh4T.png)

如果不想開啟 DevTools 也可以在主函式 `main()` 設置 **debugInvertOversizedImages** 為 true。

``` dart
debugInvertOversizedImages = true
```

當然也可以設置圖片的允許大小，透過 **debugImageOverheadAllowance** 進行調整。下方範例調整為 256kb，不過實際上要評估普遍用戶的裝置類型與記憶體使用來設置，太大反而是個風險。

``` dart
debugImageOverheadAllowance = 256 * 1024;
```

## Performance

- 可視化時間和性能指標，資訊包含每一幀在 UI Thread 和 Raster Thread 處理時間。如果此幀 UI 有卡頓情況，代表超過16毫秒，會以 Jank (slow frame) 顯示，這時候會是粉紅顏色來呈現
- 以柱狀圖表呈現，x 軸為第幾幀，y 軸為消耗毫秒數。中間灰色線代表 8ms，也就是在它以下即可擁有 120 幀的表現
- 整體操作體驗良好，易讀性高

![Performance](https://i.imgur.com/hySlHLJ.gif)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687LDsH0mEHCT.png)

右邊有告知每個顏色所代表的資訊：

1.  淺藍色 → UI Thread(CPU Thread)，代表 Dart VM 上的所有運行程式碼，處理 Layout、Paint，接著將 Layer Tree 交給 Raster Thread。必須確保過程同步運行，不能阻塞
2.  深藍色 → Raster Thread(GPU Thread)，負責處理渲染，背後有 Skia 和 Impeller 圖形引擎的計算，最終透過 GPU 將像素顯示出來
3.  橘紅色 → Jank 卡頓幀，代表一幀可能接近或超過 16ms，有性能疑慮
4.  深紅色 → 著色器編譯問題，在目前 Impeller 引擎上不會有影響，比較有關係的是還在使用 Skia 的 Android 設備，需要注意
5.  顯示一秒的平均幀數。以範例使用的設備，支援 ProMotion 120 fps，性能上有一點差異

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687w0f2dsT4My.png)

### Frame Analysis

幀分析。查看當前幀的 UI 與 Raster 處理時間，以下方範例來看，就是 Raster 部分特別耗時。以經驗來看可能跟顯示圖片、圖像有關  
![](https://ithelp.ithome.com.tw/upload/images/20231006/201206870uXLdpnPtp.png)

### Raster Stats

渲染光柵狀態。針對當下取得快照，了解當前幀的詳細資訊，包含被處理的每個元素、渲染時間、每個元素佔的總體比例。

實際在 Flutter Rendering Pipeline 裡 RenderObject Tree 會轉為 Layer Tree，接著交給 Compositor 將每個 Layer 組合起來並匯出圖層，詳細可以留到其他文章來討論。所以畫面上才會顯示第幾 Layer。  
![Raster Stats](https://i.imgur.com/J8KpQN0.gif)

以範例來看，確實最耗時的部分為顯示圖片，接下來可以根據這點進一步確認相關程式碼，進行檢驗和優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687G7BkDIzG1f.png)

### Timeline Events

- 以火焰圖顯示每幀的事件、任務資訊
- 多元操作
  - 使用鍵盤 **WASD** 操控，上下為縮放，左右為移動
  - 框選多幀的工作任務，查看每個任務耗時多久、執行次數
  - 支援 **SQL** 查詢，擷取特定數據
- 在 Flutter 3.10 推出改版，使用 **Perfetto** 開源工具重寫，可處理更多數據，同時性能表現更好

![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687yZ9pRWB4O8.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687zjwTvtDSa8.png)

注意：右上角的刷新按鈕，很容易會造成卡頓和網頁崩潰，可能因為資料量太大無法及時處理，這部分可以等待優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687umE1i0XbUi.png)

在 Flutter 可以使用 Timeline 計算事件的運作時間

``` dart
Timeline.startSync("tag")
...
Timeline.finishSync()
```

### Performance Overlay

- 在設備上顯示每幀的即時渲染資訊，包含最高和平均處理時間
- 上方為 Raster Thread。如果超過 16ms，表示場景渲染成本太高
- 下方為 UI Thread。如果超過 16ms，表示 build、layout、paint 成本過夠

![Performance Overlay](https://i.imgur.com/6Z2SLba.gif)

### Enhance Tracking

針對 Timeline Events 進行更詳細的追蹤，可以開啟 **Widget Builds**、**Layouts**、**Paints** 三種模式。也因為要追蹤更多數據，所以開啟後可能會影響 APP 的運行表現，幀數可能下降。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687K5SdL8pJuR.png)

從中也可以更了解 Rendering Pipeline 的整個過程，Build、Layout、Paint、Compositing、Finalize Tree，接著到 GPU 的 Rasterizing 處理。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687XdH5G35mph.png)

#### 1. Track Widget Builds

可以清楚了解這一幀 build 的結果，瀏覽 Widget Tree。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687anERLdqGAI.png)

#### 2. Track Layouts

追蹤佈局排版，所以會看到 RenderBox、RenderPadding、RenderFlex 等等相關角色。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687mYE4RV81Yp.png)

#### 3. Track Paints

追蹤繪製過程中的相關資訊。  
![](https://ithelp.ithome.com.tw/upload/images/20231006/20120687AKbWPYfj3I.png)

### More debugging options

#### 1. Render Clip layers

檢查有關裁剪的相關操作，例如：ClipRRect。屬於昂貴任務，尤其是對於 Skia 圖形引擎 ，濫用可能會造成掉幀、卡頓。

#### 2. Render Opacity layers

檢查不透明效果的相關操作，例如：Opacity、BackdropFilter。屬於昂貴、高成本任務。

#### 3. Render Physical Shape layers

檢查使用 Physical Shape 陰影效果的操作，例如：Shadow、Elevation。濫用也有可能造成效能影響。

以上三個操作對於 Skia 來說成本較高，請適當地使用它們，而對於新的 Impeller 引擎的負擔就小很多，可以等待 Android 穩定釋出，再來觀察整體效能表現。相關細節可以查看其他文章，有關開發技巧，以下是連結：

> - [Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)](https://ithelp.ithome.com.tw/articles/10330647)
> - [Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)](https://ithelp.ithome.com.tw/articles/10331424)

------------------------------------------------------------------------

## 總結

本文從說明何謂 APP 順暢、性能影響因素，再到個別工具的使用，讓大家可以搭配圖片與實際範例更好地去理解。身為開發者都應該懂的如何使用它們，開發過程中使用 Inspector 協助檢查畫面結構與元件細節。接著，在產品需求完成後，可以花一點時間使用 Performance 確認實際的 release 表現，幀數是否正常，是否有 Jank 發生，持續地改善產品，讓使用者有個完美體驗，這應該是開發者都要注重的環節。

DevTools 本身很強大，它的價值可不要忽略囉！

## 延伸閱讀

- [Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)](https://ithelp.ithome.com.tw/articles/10335918)
- [Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)](https://ithelp.ithome.com.tw/articles/10336004)

## 相關資源

- <https://docs.flutter.dev/tools/devtools/inspector>
- <https://docs.flutter.dev/tools/devtools/performance>
- <https://www.youtube.com/watch?v=_EYk-E29edo&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=nq43mP7hjAE&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vVg9It7cOfY&ab_channel=Flutter>

## Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)

- 發布時間：2023-10-07 19:47:19
- 原文連結：<https://ithelp.ithome.com.tw/articles/10335918>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 22 篇

![](https://ithelp.ithome.com.tw/upload/images/20231007/201206877MGFi7mRZQ.png)

來到了 DevTools 系列的第二章，上一篇我們講解了 Flutter Inspector 與 Performance 用法，使用工具瀏覽 Widget Tree 架構，並了解 UI Thread、Raster Thread 每幀表現，有效幫助我們定位出問題來源。本文延續到重要的 CPU Profiler、Memory 與 Logging，可以知道程式碼與函式的消耗時間，從中思考寫法上是否要改變，再來就是記憶體的使用情況，關乎 APP 運行情況的關鍵數據，透過這些工具去優化產品、改善體驗。如果不知道如何使用或不熟悉的話沒關係，跟著我快速認識並掌握它們！

------------------------------------------------------------------------

## CPU Profiler

監控 **CPU** 使用情況，錄製對 APP 的互動和操作，可以查看每個函式的執行時間，包含 Total Time 和個別的 Self Time，從花費最多時間的部分進行優先檢查和處理，太久可能會導致性能問題。

- **Total Time** → 執行本身之外還包含其他呼叫的相關方法函式，全部所花費的時間
- **Self Time** → 執行本身所花費的時間
- 使用方式：點擊 `Record`，操作 APP 指定流程，點擊 `Stop`，資訊會很快地載入出來  
  ![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GntbwFB1m8.png)

右上角提供了其他操作，包含 **Filter**、**Display guidelines**、**Expand All**、**Collapse All**。很棒的是還能查看其他 Isolate 的運行狀況，從中間下方的選單挑選。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UquTE2Lfup.png)

### Bottom Up

- 顯示表格資訊，從上到下的執行，根據花費時間的多少來排列，可以根據欄位進行排序

![Bottom Up](https://i.imgur.com/inKiJh7.gif)

### Call Tree

- 顯示表格資訊，專注於長時間處理的部分

以範例來看，畫面是在執行動畫，所以可以看到相關的處理函式  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UUSOo3288a.png)

### Method Table

- 瀏覽所有函式的時間佔比，呈現 **percent** 數字
- 點擊每個函式後還可以看到誰呼叫，以及它呼叫了哪些函式

![Method Table](https://i.imgur.com/azJEfwU.gif)

### CPU Flame Chart

- 顯示火焰圖表
- 上層呼叫下層函式，而每個項目的寬度代表實際在 Call Stack 上花費的時間多寡
- 可以使用鍵盤的 WASD 來操作左右以及縮放

![CPU Flame Chart](https://i.imgur.com/rLGLMky.gif)

搜尋框的旁邊有個幫助按鈕 `?`，說明可以執行的介面操作與顏色意義。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687blkTJ0guMs.png)

### Profile app start up

- 載入第一幀之前的 CPU 資訊，可以識別 APP 啟動前是否有延遲。四個 Tab 都會同時載入相關數據
- 使用方式：當 APP 第一時間啟動時開啟 DevTools，並立即到 CPU Profiler 點擊 **Profile app start up**

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687zqqfTs2jHl.png)

### Load all CPU samples

包含 Main isolate 和其他 isolates 的資訊，當要查看其他 isolate 的運作狀況時必須點擊，載入相關資料。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687QPtQAEyy8v.png)

### CPU sampling rate

- CPU 資訊的精細程度，代表 Dart VM 搜集 CPU 樣本的速率，預設為 **medium**
- low、medium、high，三種採樣率分別為 `1,000 Hz`、`4,000 Hz` 和 `20,000 Hz`，素率越高搜集的樣本越多
- 在 high 模式下，因為需要更頻繁地處理數據，取得更多資料，可能會引響到效能表現

在 **low** 模式，進行指定的操作路徑錄製，花費 2.2 秒，蒐集到 114 筆數據，平均51筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687nRa4eqlHlE.png)

在 **medium** 模式，進行指定的操作路徑錄製，花費 1.5 秒，蒐集到 177 筆數據，平均118筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206875m6GDYsPTa.png)

在 **high** 模式，進行指定的操作路徑錄製，花費 2.6 秒，蒐集到 453 筆數據，平均174筆/秒  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687z2NODODaJm.png)

## Memory

可視化記憶體的使用情況，檢查物件和記憶體，嚴重可能導致 App 崩潰關閉。正常來說，**Dart VM** 會在物件創建時為它分配記憶體，並在 Object 不再使用時釋放內存、清除，這時候會需要 **Dart GC**。

什麼情境下需要使用：

- APP OOM 崩潰
- 幀數下降
- 操作體驗不良，可能速度變慢或沒有反應
- 記憶體異常暴漲
- 記憶體洩漏

> 適合 Profile 下使用 Memory 檢測，Debug mode 表現上會有些許差異

顯示熱視圖，可以放大並詳細查看正在處理、運算的內容  
![Memory](https://i.imgur.com/n2baDQv.gif)

### Legend Board

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687eF8ctCxCxh.png)

#### Events

描述顏色意義，代表每個動作和事件

#### Memory

- **RSS** → 加載到 RAM 中而且可以立即使用的部分
- **Allocated** → 已分配的記憶體，提供給特定工作或進程使用，且不能供其他人使用的部分
- **Dart/Flutter** → Heap 裡 Dart、Flutter 的記憶體
- **Dart/Flutter Native** → Dart VM 佔用原生物件時使用的記憶體
- **Raster Layer** → Flutter Engine 光柵緩存層的記憶體大小
- **Raster Picture** → Flutter Engine 光柵緩存層裡圖片的記憶體大小

點擊虛線就會顯示指定時間點的記憶體資訊，包含裝置的紀錄時間。另外，如果剛好 Dart 有執行 GC 處理，就會多一個藍色點點。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687Nv4bDiuQHJ.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687EinzlM8QPZ.png)

### Time Range

顯示時間區段內的資料。點擊下拉式選單，可以控制圖表上顯示的時間區段，如果時間越長顯示的數據就會越多，可能就會讓操作有點遲緩。

![Time Range](https://i.imgur.com/1zdjWsv.gif)

### GC Manually

在 DevTools 支援手動 Garbage Collecting，即時釋放記憶體資源。  
![GC Manually](https://i.imgur.com/JbZCIan.gif)

### Profile Memory

如果發現有未使用的物件，那這些實體就是內存洩漏的原因，如果超過設備的可用記憶體容量，APP 就會崩潰。我們可以從表格觀察物件的 **Instances count**、**Total Size**、**Dart Heap Size** 了解記憶體使用狀況，透過欄位幫助排序，更快地找出原因。  
![Profile Memory](https://i.imgur.com/f7a8jSJ.gif)

可以導出 CSV 報告文件  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206872X4Il9qNgl.png)

### Diff Snapshots

根據當前的 APP 狀況進行快照，擷取所有記憶體使用資訊。可以搜集兩個場景的狀態，使用 Diff 進行比對，可以看到 Instance 數量和記憶體大小的變化，有差異的話前面會有正負號。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GfMMiDoQVX.png)  
![Diff Snapshots](https://i.imgur.com/yLo3wNK.gif)

### Trace Instances

追蹤指定 Class 的變化，了解實體數量，並附帶佔比，讓我們更了解實際情況。經由 **Bottom Up** 和 **Call Tree** 瀏覽被使用的時機點，資訊被描述的很清楚。

使用方式：

1.  選擇要追蹤的 **Class**
2.  在 APP 進行一些場景操作
3.  點擊 **Refresh**
4.  查看 **Instance** 變化與詳細資訊

以下圖示官方提供。實際使用時 DevTools 會崩潰，無法附上實際 APP 運作狀況，先回報官方等修復。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687rZ5PX0gHWS.png)

### 幾個記憶體優化的習慣

#### 1. WeakReference

- 使用 **WeakReference**，儘管有指向也允許隨時被 GC 處理
- 用來存取值的 `target` 屬性，可能會是 null，要進行額外檢查
- 如果物件在很多地方被使用的話，必須注意它是否有被 GC 釋放掉

#### 2. Create object lazily

- 對物件延遲創建、初始化，在需要時才存在
- 使用 `factory constructor`、`getter`、`late initializer`

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687FhykQzstNY.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687GJckRb2TWi.png)

#### 3. Discard resources

- 確保在 `dispose()` 裡有準確釋放物件、資源
- 可以宣告物件為 **nullable**，在 `dispose()` 後給予 null，標示為可以被 GC

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687lygddQbLBV.png)

#### 4. Use const constructor

- 在 compile-time 編譯時就確定
- 當有多個相同屬性欄位的物件和元件，它們實際上是同一個實體，記憶體消耗也只有一個
- 在 **debug mode** 的情況下兩個相同的 const 物件因為有 debugging tools 所以不會相同，但是在 **release mode** 會是相同物件

## Logging

- 監控運行時生成的訊息和 Log 日誌，有包含標記，資訊更完整，可進行更細微的檢查
- 查看 Dart 和 Flutter 資訊，從 `Kind` 藍為辨識，例如：**Dart GC**、**Flutter Framework**、**Image**，還有我們的自定義的訊息
- 善用搜尋框，即時反應、速度非常快，可以根據類型、關鍵字輸入

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687JmdPL7Yxqe.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687UrvC8xY1tn.png)  
![Logging](https://i.imgur.com/9thNFOU.gif)

- 根據 Kind 種類進行過濾，使用 `k` 代表，以逗點來設置多個關鍵字

以下範例查看 Framework 相關資訊：  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687oX2QriQqoF.png)

### Flutter Log Printer

- 使用 `debugPrint()`，保持訊息的完整，不會被截斷
- 在 Logging View 裡面的種類為 `stdout`

針對 Production 環境設置，確保在正式環境不會紀錄 log 資料，避免資料洩漏：

``` dart
void main() {
    if (isProd && kReleaseMode) {
      debugPrint = (String? message, {int? wrapWidth}) {};
    }
}
```

------------------------------------------------------------------------

## 總結

相信到這裡大家應該更知道如何使用它們了，官方團隊持續地在進行優化，結合目前的 Material 3 設計，重點就是要讓開發者更方便地去使用，不管是 UI 還是檢測功能都完整了。我們當然不能忽視它，DevTools 的 **CPU Profiler** 與 **Memory** 是核心功能，APP 的效能表現一目了然，不要因為自己的手機順暢就覺得沒有問題，每位用戶的裝置、配備可是差異很大。有關 Object 數量、時間消耗、記憶體變化，每個環節都可能會導致應用卡頓，需要我們在開發時特別注意，所以效能調校、優化產品是非常重要的。我們不只要完成一個產品，還要完成一個好的產品，你說是吧！

## 延伸閱讀

- [Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)](https://ithelp.ithome.com.tw/articles/10335311)
- [Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)](https://ithelp.ithome.com.tw/articles/10336004)

## 相關資源

- <https://docs.flutter.dev/tools/devtools/cpu-profiler>
- <https://docs.flutter.dev/tools/devtools/memory>
- <https://docs.flutter.dev/tools/devtools/logging>
- <https://www.youtube.com/watch?v=_EYk-E29edo&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=nq43mP7hjAE&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vVg9It7cOfY&ab_channel=Flutter>

## Day 23: 帶你完整探索 DevTools，聰明的使用 Network、App Size Tool 與 Skia Tool (Debugging with DevTools - part3)

- 發布時間：2023-10-08 18:07:51
- 原文連結：<https://ithelp.ithome.com.tw/articles/10336004>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 23 篇

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687cipxd4GaqI.png)

本文為 Debugging with DevTools 系列的第三章，前面談論到了 Flutter Inspector、Performance、CPU Profiler、Memory、Logging，每個工具的細節以及使用方式，搭配實際操作讓大家快速理解，希望讓大家重視 DevTools 的重要性，有興趣的朋友請點擊連結閱讀：

> - [Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)](https://ithelp.ithome.com.tw/articles/10335311)
> - [Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)](https://ithelp.ithome.com.tw/articles/10335918)

到了最後章節，要跟大家分享 Network、App Size Tool 與 Skia Screenshot，對於網路監測也是跟效能與安全性相關，如何確定相關操作都是信任且低成本。再來是分析 APP 每次改版後的安裝包，很適合進行體積優化時運用。最後說明如何了解 Skia 渲染過程的工作。會說明為何使用它們以及如何使用，相信這些工具的價值後，DevTools 能很大程度地給予協助，讓產品變得更好。跟著我繼續探索吧！

------------------------------------------------------------------------

## Network

瀏覽任何 HTTP、HTTPS 或其他的網絡請求，有關網路的事物都可以進行監控。

- 過濾 APP 的所有網路請求，包含 API Call、網路圖像等等
- 檢查 API 請求的操作是否恰當，太多或時間太久可能導致 APP 效能變差
- 根據處理時間來判斷是否後端效能需要優化，時間越短用戶體驗越好
- 可以用來確定第三方套件是否有發出其他陌生請求，確保安全性
- 盡可能減少網路請求，因為第一個它花時間，第二個是有盜竊風險

![](https://ithelp.ithome.com.tw/upload/images/20231008/20120687V48EDWYpJj.png)

了解每個請求的消耗時長，不符合期待的話可能就需要進行優化  
![](https://ithelp.ithome.com.tw/upload/images/20231008/20120687HTHgYWTVlX.png)

額外補充：手動計算非同步任務的耗時，可運用在對後端與資料庫的操作上，方便測量與檢查

``` dart
Future<T> measureTime<T>(Future<T> Function() task) async {
  final startTime = DateTime.now();

  final result = await task();

  final duration = DateTime.now().difference(startTime);
  debugPrint('Time: $duration');

  return result;
}
```

可以針對 `method`、`status`、`type` 進行過濾，以逗點來設置多條件篩選  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206874L01KVX0gV.png)

輕鬆瀏覽每個回應，以範例來看就是一個完整的 Json 格式，並且可以直接複製 Json String。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687vZtiKxsoxa.png)

## App Size Tool

瀏覽輸出安裝檔的體積詳細資訊。在進行 AOT 編譯時(Profile、Release) 會使用 **tree-shaking optimization** 去除沒有使用的程式碼，對 APP 體積優化。優化過後的體積資訊，就是工具所分析的內容，包含 **Dart Code**、**Native Code**、**Asset**、**Package**、**Font** 等等，還可用於分析兩個版本的差異，確認優化方向。

> 提醒：不需要運行 APP 就能使用工具，因為主要是讀取生成的報告 json 檔

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687lPuuRzHU79.png)

### Command

進行安裝檔分析，完成後會輸出一個檔案，例如：aab-code-size-analysis_01.json

``` bash
# 1. Normal
flutter build appbundle --analyze-size
flutter build ipa --analyze-size
flutter build apk --analyze-size
flutter build linux --analyze-size
flutter build macos --analyze-size
flutter build windows --analyze-size
...

# 2. Use arg '--target-platform'
# android-arm, android-arm64,android-x64
flutter build appbundle --analyze-size --target-platform=android-arm64

# 3. Use flavor file
flutter build appbundle --analyze-size --target-platform=android-arm64 --flavor dev --target ./lib/main_dev.dart
flutter build ipa --analyze-size --flavor prod --target ./lib/main_prod.dart
```

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687hgDVUvQPq9.png)

#### Example - Android

完成後會告知分析報告的路徑(例如：aab-code-size-analysis_01.json)，以及檔案的體積大小  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687NoPaa158Gx.png)

#### Example - iOS

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687AHQgg9cHeH.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687mB7INxv1GH.png)

### Tool - Analysis

點擊 **Import File** 按鈕匯入原有的 APP 分析檔案(副檔名 .json)，接著使用 **Analyze Size** 分析 APP 並顯示可視化的階層架構圖。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687q1m8rLl4EL.png)

從中可以得知資訊有很多，包括：

- 分析報告的生成時間
- 總體積大小
- 每個元素的大小以及整體佔比，例如：**flutter-assets**、**android-res、flutter(libapp.so/Dart AOT)** 等等
- 套件相關資訊

![](https://ithelp.ithome.com.tw/upload/images/20231007/201206871ejbOz5uN9.png)

可以輕鬆瀏覽每個目錄、檔案，甚至是程式碼的大小。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687hAk5la2gxq.png)  
![Tool - Analysis](https://i.imgur.com/SMah5sb.gif)

以範例來看，iOS 比 Android 大了一些，其中 **flutter_assets** 體積佔比較高，可能是圖片和相關資源使用太多，可以從中進行優化。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687Go8PfbYcZq.png)

### Dominator Tree

由下往上快速尋找根本節點。當發現編譯後出現一些陌生的套件和程式碼，可以簡單地網上尋找的來源。

### Call Graph

瀏覽程式碼和套件的依賴關係，誰使用了誰，可以快速地幫助我們確認。**左邊依賴中間、中間依賴右邊。**  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206871DEivOV9jf.png)

### Tool - Diff

- 兩個版本分析資訊的比較，例如：v1 跟 v8
- 每個部分、每個檔案都會進行比較，**綠色代表大小增加、紅色代表大小減少**。查看是哪些修改才導致有變動

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687cmx4B2SiNf.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206874gfhMUxG86.png)  
![Tool - Diff](https://i.imgur.com/e2QQYoZ.gif)

### 如何優化 APP 大小？

1.  刪除沒有使用到的檔案，例如：圖檔、字體、聲音檔
2.  優化、壓縮圖像，例如：PNG、JPG、Webp
3.  使用現代動畫文件格式(Lottie、Rive、Webp)，減少 GIF 使用
4.  自定義字體可使用 `google_fonts` 套件，首次運行時下載遠端字體，緩存在設備中
5.  選擇佔用空間小的第三方套件
6.  混淆 APP 程式碼以降低體積

### 實際商店的下載大小

`flutter build` 指令生成的版本，無法代表最終用戶的下載大小。商店通常會針對不同的情境，重新處理上傳的 APP 檔案，例如：根據手機 DPI 過濾資源、根據 CPU 架構過濾 library。\*\*\*\*

#### Android

在 **Google Play Console** 介面，再上傳點擊 **Android vitals** 裡面的 **App size** 分頁，瀏覽 APP 的安裝大小。但這資訊只是差不多，實際會根據設備而有所差異。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687bVw8YNzmZi.png)

另外，也提供了細節分析，了解資源的大小佔比。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687OOEnpyU9xR.png)

------------------------------------------------------------------------

## Skia Screenshot

- 查看渲染過程，了解是否有造成內存和計算成本高的地方
- 使用 **Skia WASM Debugger**，載入 Skia Screenshot，副檔名為 `.skp`

``` bash
flutter screenshot --type=skia --observatory-url=[enter url]

# Example
flutter screenshot --type=skia --observatory-url=http://127.0.0.1:63013/WwOC4V-UQvU=/
```

1.  首先執行 Flutter App，成功運行後會有一個本地的幀錯 URL，它就是指令上的 `observatory-url`，在 Terminal 使用指令生成一個 skia 快照檔案，例如：flutter_01.skp

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687BSuzktXtNN.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206872Xoz7y5zcv.png)

1.  在瀏覽器開啟 <https://debugger.skia.org/> 連結，它是 Skia Debugger 工具，開啟剛剛生成出來的 Skia 快照

> [Skia Debugger](https://debugger.skia.org/)

從範例來看，可以左側了解畫面的處理細節，是否有使用到裁剪以及 Save 等等相關操作，尤其是 saveLayer 操作，本身對於 Skia 較昂貴，濫用的話可能會直接影響到性能、表現幀數。

我們也能從右邊的列表了解每個操作的次數，經過程式碼與 UI 的優化後，再回來比對，接著瀏覽 Performance View，確認性能是否提升。  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687HhlvXu53eo.png)  
![Skia](https://i.imgur.com/Q156oNh.gif)

## 💡其他技巧

### debugFillProperties()

- 在自己的 RenderObjectWidget 使用覆寫 `debugFillProperties()`，幫元件新增自訂義的 debug 屬性
- 在 **Widget Details Tree** 最外層顯示屬性，不需要點擊到最深處去了解
- 透過 **DiagnosticPropertiesBuilder** 新增屬性，設置 **DiagnosticsProperty** 子類別

``` dart
StringProperty
DoubleProperty 
PercentProperty #限制在0和1之間
IntProperty
FlagProperty #布林值
EnumProperty
IterableProperty
ObjectFlagProperty #基本描述
ColorProperty
IconDataProperty
```

查看 Column 元件，使用了 MultiChildRenderObjectWidget，其中定義了幾個屬性  
![](https://ithelp.ithome.com.tw/upload/images/20231007/201206879thgCv0PL7.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687beqXpDrkAs.png)

### checkerboardOffscreenLayers

- 檢查畫面上的元件是否有使用到 `saveLayer()` 相關操作，有的話會透過棋盤格呈現
- `saveLayer` 是 Canvas 的高成本、耗性能工作，例如：UI 的透明度、陰影效果、裁切，盡量避免濫用

``` dart
checkerboardOffscreenLayers: true,
```

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687dxB51irX6o.png)

### checkerboardRasterCacheImages

- 瀏覽圖片光柵緩存的情況，檢查有沒有給靜態圖像做緩存，沒有的話會導致每次 build 都重新繪製，以棋盤格呈現
- 可以幫靜態圖像使用 `RepaintBoundry` 包裹，將包裹的 Widget Tree 做隔離，不受影響，但是此操作是繁重的工作，增加 GPU 負載。引擎會自動判斷圖像是否複雜到需要 RepaintBoundry，協助我們作出優化決策

``` dart
checkerboardRasterCacheImages: true,
```

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687E1ZpoQLMQz.png)

### debugPaintSizeEnabled

- 瀏覽每個元件的繪製範圍。幫每個 RenderBox 在周圍繪製框線，並且包含 RenderPadding，以不同的顏色呈現。
- 可在 `main()` 進行全局設置

``` dart
debugPaintSizeEnabled = true,
```

![](https://ithelp.ithome.com.tw/upload/images/20231007/201206871aLq9X69WC.png)

#### 僅繪製指定元件

- 自定義 **SingleChildRenderObjectWidget** 和 RenderProxyBox，自行處理、實作 `paint()` 的工作內容，並且根據狀態決定是否顯示
- 參考 **Simon LightFoot** 分享的開發技巧

``` dart
class RenderShowDebugPaint extends RenderProxyBox {
    RenderShowDebugPaint({required bool enabled, RenderBox? child})
      : _enabled = enabled,
        super(child);

    bool _enabled;
  bool get enabled => _enabled;

  set enabled(bool value) {
    if (_enabled != value) {
      _enabled = value;
      markNeedsPaint();
    }
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    final previousState = debugPaintSizeEnabled;
    debugPaintSizeEnabled = enabled;
    super.paint(context, offset);
    debugPaintSizeEnabled = previousState;
  }
}
```

![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687e78UAgNBha.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231007/20120687xGSc8o2Gx7.png)

## Performance FAQ

Flutter 官方整理了相關的 Debugging 和 Optimizing 內容，有時間的朋友建議花時間了解，對我們開發很有幫助。

> [Flutter Doc](https://docs.flutter.dev/perf/faq)

![](https://ithelp.ithome.com.tw/upload/images/20231008/20120687sntq3hlxp5.png)

------------------------------------------------------------------------

## 總結

本文完整了 Debugging with DevTools 系列，希望這三章有幫助到大家，這系列沒有什麼艱深的觀念與知識，只是要喚醒大家對於 DevTools 的重視。看到大部分開發者都著墨在開發需求上，完成任務很棒，但如何讓產品變得更好，從中提升品質標準，這部分需要培養與習慣。

> - [Day 21: 帶你完整探索 DevTools， Flutter Inspector 與 Performance 用法 (Debugging with DevTools - part1)](https://ithelp.ithome.com.tw/articles/10335311)
> - [Day 22: 帶你完整探索 DevTools，重要的 CPU Profiler、Memory 與 Logging (Debugging with DevTools - part2)](https://ithelp.ithome.com.tw/articles/10335918)

而除了 Debugging 之外，前面文章也提到了開發技巧與圖片優化，將連結都附在下方讓大家方便閱讀。之後的 DevTools 相關內容，會分享一些實際專案的案例，也歡迎提出來做個交流，或許有什麼好玩的東西還沒發現呢～

## 延伸閱讀

- [Day 14: Flutter 效能優化，良好的開發觀念與技巧！(上)](https://ithelp.ithome.com.tw/articles/10330647)
- [Day 15: Flutter 效能優化，良好的開發觀念與技巧！(下)](https://ithelp.ithome.com.tw/articles/10331424)
- [Day 16: 聊聊 Flutter 圖像使用的良好習慣，記憶體掌握與優化！](https://ithelp.ithome.com.tw/articles/10332083)

## 相關資源

- <https://docs.flutter.dev/tools/devtools/network>
- <https://docs.flutter.dev/tools/devtools/app-size>
- <https://www.youtube.com/watch?v=_EYk-E29edo&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=nq43mP7hjAE&ab_channel=Flutter>
- <https://www.youtube.com/watch?v=vVg9It7cOfY&ab_channel=Flutter>

## Day 24: 善用工具與快捷輔助，提升 Flutter 開發效率！

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

## Day 25: 不要浪費時間在無聊代碼了，實作自己的模板生成工具，Mason Brick！

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

## Day 26: 想跑 Flutter 測試但卻不想寫嗎， 試看看 Maestro UI Testing， 整合 CICD 沒問題！

- 發布時間：2023-10-11 22:45:03
- 原文連結：<https://ithelp.ithome.com.tw/articles/10337944>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 26 篇

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687DU2MqFXQ10.png)

**Maestro** 是一個完整的 **UI** 自動化測試框架與解決方案，提供豐富的文件和 API 給開發者使用，其中的連續模式就很符合人性化，像是自動 **hot-reload** 一樣，能夠有效幫助撰寫測試，而且讓非開發者也能參與，這點非常加分，整體來說體驗很不錯。

本文除了提供基本的測試範例，也使用 Script 進行自動化多 **flow** 驗證，然後提供結果報告，最後將 Maestro 添加到 Gitlab CICD 中，透過它協助檢查 Flutter 應用。過程會使用腳本啟動本地模擬器、執行多流程驗證並顯示報告、最後關閉模擬器，接著建置 App 安裝檔，然後將它部署到 App Center，讓開發者與 QA 人員可以在手機上操作。

------------------------------------------------------------------------

快速了解 Maestro 的幾個特點：

- E2E 測試框架，使用 yaml 定義測試流程
- 容忍非同步和延遲，預設會自動等待操作完成，無需撰寫 `sleep()`
- 運行後能夠持續監控測試文件的變動，並在它們發生變化時重新運行，不需要再次編譯
- 支援 **CI Integration**，自動上傳到 Maestro 平台進行測試。[link](https://www.notion.so/Maestro-80cfa567d9e94eccbe44f95413f36f52?pvs=21)
- 支援 ****Pull Request Integration****，發 PR 後自動進行測試驗證以及性能分析。[link](https://cloud.mobile.dev/getting-started/pull-request-integration)
- 支援 **Crash Analysis**，每個情況都附有螢幕錄影、Log、StackTrace
- 支援 **APP Size** **Analysis**，了解哪個部分佔比較大，可以進行特定優化
- 支援 **Memory** **Leaks Analysis**，查看洩漏狀況與原因
- 支援 **Performance** **Analysis**，測量啟動時間、執行時間，查看函式的呼叫以及耗時

目前主流 Mobile 平台都有支援：  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687yP7gCkGQvN.png)

- Android - Views
- Android - Jetpack Compose
- iOS - UIKit
- iOS - SwiftUl
- React Native
- Flutter
- Web Views
- NET MAUI iOS
- NET MAUI Android

## 安裝 Maestro CLI

``` bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687qHQ2qFgFBy.png)

## iOS 設備的前置設定

- 需要 **Facebook IDB(iOS Debug Bridge)** 工具，就像是 Android adb 工具，可以跟設備互動，查看資訊、安裝、監控還能模擬手勢操作，非常適合自動化測試

``` bash
brew tap facebook/fb
brew install facebook/fb/idb-companion
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687sC46G8KvT3.png)

💡查看設備清單與ID

``` bash
xcrun simctl list
```

\![https://ithelp.ithome.com.tw/upload/images/20231011/20120687mBNmxvKFOA.png\]

💡啟動要運行測試的模擬器

``` bash
idb_companion --boot <id of the iOS device>
```

💡連結測試模擬器，驗證是否正常，沒問題就可以將此運行關閉

``` bash
idb_companion --udid <id of the iOS device>
```

💡關閉模擬器

``` hljs
idb_companion --shutdown F7CABB3C-DD6F-432D-A86F-5884287D2261
```

> 提醒：測試目前無法跑在實際的手機設備

### 運行 APP

在測試執行前要確保已經有安裝過 APP 到模擬器，Maestro 會根據 **packageName** 或 **bundleId** 自動尋找到指定 APP 並啟動執行測試驗證

1.  IDE 運行安裝 APP
2.  Android 指令安裝
3.  iOS 指令安裝

**Android 安裝**

``` bash
adb install sample.apk
```

**iOS 安裝**

``` bash
xcrun simctl install Booted Test.app
```

### 撰寫測試

請查看我在 Medium 撰寫的文章，有講解所有的操作指令，點擊以下連結跳轉

> [指令與操作](https://medium.com/flutter-formosa/%E4%BD%A0%E7%9F%A5%E9%81%93-maestro-%E5%97%8E-%E5%85%BC%E5%85%B7%E4%BA%BA%E6%80%A7%E7%9A%84%E8%87%AA%E5%8B%95%E5%8C%96%E6%B8%AC%E8%A9%A6%E6%A1%86%E6%9E%B6-flutter-%E5%93%81%E8%B3%AA%E5%B0%B1%E9%9D%A0%E5%AE%83%E4%BA%86-part-2-%E6%8C%87%E4%BB%A4%E8%88%87%E6%93%8D%E4%BD%9C-e6327ed5ac04)

### 執行 Debug 連續測試

- 運行 **Continuous Mode**
- 運行時皆為 Hot reload 模式，即時監聽 yaml 檔案的更新，不需要重新編譯即可重新運行
- 測試過程的檢查條件會根據操作逐一確認
- **Enter** → 點擊後刷新重來

``` bash
maestro test -c flows/LaunchApp.yaml
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687a1aMadvP7o.png)  
![Continuous Testing](https://i.imgur.com/YeQ0V2C.gif)

當 **yaml** 檔的流程撰寫有誤時，會即時提醒  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687Oo398RzLzs.png)

### 執行單一 Flow 測試

整個流程會自動執行操作，並完成驗證，最後顯示通過結果

``` bash
maestro test maestro/flows/GoThirdAndScroll.yaml
```

![Single Flow](https://i.imgur.com/MbxVoYb.gif)

### 執行完整多 Flow 測試

- 測試整個資料夾，每個情境都驗證，並在運行後生成測試報告
- 不包含子資料夾
- 加上 `--format junit` 生成 XML 結果報告
- 加上 `—-output result.xml` 修改匯出名稱

``` bash
maestro test flows/

maestro test --format junit flows/
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687ApK7wa898f.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687hBF0ZZPJ84.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/201206875SkmAlZFzH.png)

### 缺點

1.  多 Flow 運行

當需要驗證多個 flow 測試時會無法正常完成，從第二個 flow 開始不會自動操作，例如：點擊按鈕、滾動等互動行為，必須手動操作畫面讓 **Maestro** 檢查，是個很不方便的過程。

這時候就自行優化囉，透過撰寫 Shell Script 來解決問題，逐一進行個別的 flow 驗證，可以查看專案的 `/scripts/run_test.sh` 檔案。

主要的想法就是把測試目錄裡的每個 flow 檔案都進行逐一驗證，並記錄成功與失敗的數量，最後顯示我需要的結果報告，並附帶測試通過率。如果需要的話，後續就能夠接著整合 CI，測試沒問題才能進行後續的 APP 建置。  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687d5wcUAfoil.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687Qbpg0kMbBW.png)

以下展示透過 script 驗證多個 flow 測試，最後提供結果  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687JtophFNx0x.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687fWphFuLtDs.png)  
![Optimize](https://i.imgur.com/UgW0KrM.gif)

2.  不支援 Flutter Key 偵測。而如果同時存在 **semanticLabel** 和 **Text Label**，則會以 semantic 優先

3.  無法在 Flutter Desktop 以及 Flutter Web 上運行

### Maestro Studio

- 開發輔助工具，就像是 Flutter DevTools
- 可抓取所有的 UI 元素，也可以搜尋關鍵字
- 生成每個 UI 元素的基本測試指令，讓使用者可以直接複製使用

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687JuNF6DaTA7.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687UzVtGwqZi7.png)  
![Maestro Studio](https://i.imgur.com/NQ4ZzZ2.gif)

### 錄製影片

支援方便的錄影功能，不需要清空桌面與調整視窗位置，Maestro 會自動幫你調整為合適位置並進行錄製，最後產出一個下載連結。非常適合需要向外部展示、分享的時候，是個貼心的功能。

``` bash
maestro record test.yaml
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687sGDTtGvfV1.png)  
![Recording](https://i.imgur.com/XCEFrjk.gif)

Maestro 錄製完成的影片，是不是非常方便，搭配簡潔好看的背景，一目了然。  
![Recording 2](https://i.imgur.com/S853srn.gif)

------------------------------------------------------------------------

## Maestro in CICD

首先我們先看 Maestro Test 整合到 **Gitlab CI** 的樣子，期望除了有 Flutter Test 驗證之外還要多一層防護罩，就是跑使用者流程的操作測試，確認都沒問題後再進行後續的 build 和 deploy，而一但發現有錯誤的話則停止動作，通知負責人員。  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687lsvVoZ2Y6n.png)

實際就是讓 **Gitlab Runner** 在機器上跑的時候可以主動啟動模擬器，接著開始進行測試驗證，當然如果你的 CICD 環境是在雲端的話可能就沒辦法使用 Maestro 了，除非是官方的 **Maestro Cloud**，很方便很好用，但是跑一個 flow 需要 0.1 美元，結果就是會花很多錢，對我們來說應該不是個很好的選擇。

### Executor

Maestro CI 需要的 Shell Script，我這邊規劃有三個

1.  `boot_simulator.sh` → 啟動模擬器
2.  `run_test.sh` → 執行測試驗證
3.  `shutdown_simulator.sh` → 關閉模擬器

#### boot_simulator.sh

裡面其實很簡單，就是透過 idb 幫我們開啟模擬器，準備待會跑測試。裡面的參數為 Simulator Deivce ID

``` bash
#!/bin/sh

# idb_companion --boot <id of the iOS device>
# excute 'xcrun simctl list' in terminal to check device list.
idb_companion --boot $1
```

![boot_simulator](https://i.imgur.com/TLi8k6Z.gif)

### run_test.sh

1.  指令要測試的 `flows/` 目錄
2.  驗證每個 Flow 流程，將失敗和成功的次數記錄下來
3.  顯示自定義的結果報告，包含總次數、失敗次數、成功次數和通過率，根據通過率檢查是否正常，一旦有測試流程失敗的情況則暫停 CICD

``` bash
#!/bin/sh

directory=../maestro/flows/

successedCount=0
failedCount=0

for entry in "$directory"*
do
    number=$(caculate $successedCount+$failedCount+1)
    echo "---------------------- Flow $number ------------------------"
   
    log=$(maestro test "$entry")

    if [[ $log == *"FAILED"* ]]; then
        let failedCount=failedCount+1
        continue
    fi

    let successedCount=successedCount+1

done

echo "------------------------------------------------"
echo

totalCount="$(($successedCount+$failedCount))"
echo "Total: $totalCount"
echo "Success: $successedCount"
echo "Failure: $failedCount"

percent=$(caculate $successedCount/$totalCount*100)
percent=${percent%.*}
echo "Pass: $successedCount/$totalCount, $percent%"

echo

goodEmoji='\xE2\x9C\x85'
badEmoji='\xE2\x9D\x8C'
if [ "$percent" = "100" ] 
then
    echo $goodEmoji$goodEmoji$goodEmoji
else
    echo $badEmoji
fi

echo

if [[ $percent == *"100"* ]]; then
    echo "Maestro tests passed!"
else
    echo "Maestro tests failed."
    echo
    
    exit 1 
fi

echo
```

![run_test](https://i.imgur.com/hlFEoKv.gif)

### shutdown_simulator.sh

顧名思義，就是關閉模擬器，節省機器的資源

``` bash
idb_companion --shutdown $1
```

## Usage

1.  首先取得模擬器的設備資訊，記好要跑測試的 Device ID，Android 或 iOS 設備都可以

``` bash
xcrun simctl list
```

![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687YdDxx0oSZY.png)

2.  啟動模擬器，參數為要測試的 Device ID

``` bash
./boot_simulator.sh F7CABB3C-DD6F-432D-A86F-5884287D2261
```

3.  運行測試

``` bash
./run_test.sh
```

4.  關閉模擬器，參數為要測試的 Device ID

``` bash
./shutdown_simulator.sh F7CABB3C-DD6F-432D-A86F-5884287D2261
```

## Demo

![Demo](https://i.imgur.com/1P3oTQl.gif)  
![](https://ithelp.ithome.com.tw/upload/images/20231011/20120687dCvThFrHXc.png)

------------------------------------------------------------------------

## 總結

本文的最後提到 CICD，使用 Maestro 整合的部分需要做個補充。在流程開始會先驗證所有測試，都正常才會進行後續的 build 和 deploy，也因為 Maestro 需要模擬器的協助，所以需要確保你的 CICD 可以和自己準備的環境溝通。如果像 Codemagic 服務都在雲端運行的話可能就無法使用 Maestro，還是要根據需求去決定使用哪種方式。

最終，所有的測試還是必須與自動化流程結合，才能有效節省時間成本，而 Maestro 本身有這個能力，它讓不是開發者的其他人也可以很容易地編寫測試細節。如果大家正在煩惱沒時間寫測試，或是現在才知道 E2E Test，Maestro 都值得你和團隊嘗試一次，從中運行過玩過才會知道是否適合產品。

總而言之，Maestro 是一個很完整且穩定的第三方測試服務，官方不僅活躍也有自己的 Slack 空間，有興趣的朋友可以持續關注接下來的進展與版本更新，有任何想法也都歡迎跟我討論哦～

## 相關資源

- <https://maestro.mobile.dev/>

## Day 27: 什麼是 Atomic Design 與 Design System？從 Flutter 快速掌握它們！

- 發布時間：2023-10-12 22:09:35
- 原文連結：<https://ithelp.ithome.com.tw/articles/10338681>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 27 篇

![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687U8duLHQwbd.png)

首先請問大家幾個問題：

1.  在開發產品時，公司和團隊裡有 UI 設計師嗎？有根據設計使用的文字、大小、顏色、空格間距等等，來開發嗎，是否完全相同？
2.  有關數值的設置都是直接 hard-coding 寫死嗎？還是有自己管理的模組規則？
3.  UI 使用的數值有兼顧到多尺寸裝置和螢幕適配嗎？
4.  有實行模組化開發嗎？團隊有自己的元件庫嗎？是否重複使用元件？
5.  自定義元件是否和設計師提供的相同？是否有將實作完成的元件與設計師分享？檢核是否一致？
6.  公司和團隊有完整的 **Design System** 嗎？還是個別專案自己有自己的一套，可能會重複開發 UI 相關內容？

以上的問題都跟 Design System 有關，可以根據目前的問題多寡、情況來判斷需要它的急迫性，理論上只要是公司、團隊開發都必須有自己的設計系統。簡單來說，就是能確保開發的高效與品質。

------------------------------------------------------------------------

## What is Design System?

![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687aCtQWylIqt.png)

Design System 的出現，讓我們為公司、品牌創建一套遵循標準，按照這套標準進行所有的產品開發，讓設計與 APP 開發出來的效果能夠完全一致。其中包含給整個生態系統 (Android、iOS、Web…) 使用到的元件庫，包含字體、文字大小、字體、圓弧、間距大小、顏色等等，讓公司的所有產品達到一致性，擁有獨特且識別度高的外觀特色。

設計師與開發者兩端遵守相同規範下，能有效避免開發者個人風格的問題，導致程式碼混亂，成品會有落差。也因為必須跟隨設計的腳步移動，如果有任何的新增或修改，都需要跟設計甚至是團隊討論，有需要有價值的東西才會調整規範。

思考一下，如果大家都遵從 Meterial Design 去設計品牌的產品，是不是會有很多 APP 看起來都差不多，當然 Meterial 出發點很好，提供了標準讓大家遵從並快速開發，但這樣使用者體驗上還會有趣嗎？產品能夠讓他們產生印象嗎？跟品牌核心概念一樣，就連輸出的文字內容，都能算是設計的其中一環，我們是不是該開始重視 Design System 了呢？

## Design System 職責

### 1. 共同語言

開發團隊與設計人員經由共同語言互動，不需要進行翻譯

- **顏色**

  通常我們會需要代表品牌和產品的幾種顏色，1 ~ 3 種，如果以 Material 3 設計來看就是，primary、secondary、tertiary。除此之外，可能還有自定義的功能、特殊配色，例如：banana、sunshine、sea 等等的命名方式，擁有屬於自己的特點與內部溝通方式。

- **字體**

  大多數情境下可能只會包含 2 ~ 3 種字體，不過還是一樣，取決於產品需求。一種字體給標題使用，一種則為正常文字顯示，以固定且可讀性高的字體樣式去規劃，這也稱為簡潔有力。因為如果在字體使用過多的情況，或是特殊字體，可能會導致 APP 體積或是效能受影響。我們需要在理想與實際層面達成最佳實踐。

- **尺寸、間距**

  不管是文字大小還是 Padding 等等空間數值，需要有幾種產品風格的標準。例如：以基於 4 的倍數比例作為定義標準，對於 iOS、Android 和 Web 來說能夠正常處理適配，包含圖像的倍數顯示，也能夠顯示更多細節。

- **圖像格式**

  正確的使用圖像，制定 Icon 與各種圖像細節的使用原則，並根據場景選擇最佳的圖像格式。例如：Icon 以 svg 為主、照片為 jpg、細節重視的部分使用 png。

### 2. 重複使用

可重複使用的 UI 元件

- 原子設計

  元件庫裡的內容基於原子設計(以下會進行說明)，將頁面切分開為 Template、Organisms、Molecule，它們都是基於 Atom 實現，大型元件都是基於細小元件而組成，可以實現耦合度低且好測試的武器庫，在某個元件更新後也不太會影響到其他元件

- 自訂類別

  擁有產品的 Class，像是 Text 有 AppText、HFText，或是顏色 HFColor，團隊的每位成員都遵從這些自定義 Design Class 去開發，不使用 SDK 元件

- UI 庫、套件

  創建 UI Package，可以是本地包，在當前專案管理就好。也可以放置在私有的 Git 空間，提供多個公司產品去使用，確保風格的一致性

## 分子設計(Atomic Design)

Atomic Design 是由 **Brad Frost** 在 2013 年提出的概念，從上化學課程得到的體悟，從原子結合後轉變為分子，分子可以再繼續成為更複雜的產物，所以的東西都不能缺少最基本的原子。對於實際的 UI 開發層面，本身就是由每個單一元件組成，最後呈現出來給使用者。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687NdZUjIIzEy.png)

### Atoms

- 原子，為最根本的元素，也就代表無法再進行分割，透過它們呈現出最終畫面
- 在 Flutter 開發中，就像是 Text、ElevatedButton、Image、Icon 等等元件，擁有基本的操作行為，並透過它們進行組合  
  ![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687POWkmsHtwn.png)

實際範例：  
畫面上有 Text、IconButton、Image 等等，這些都是獨立且無法分割的元件。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687Ol00gEdRpH.png)

### Molecules

- 分子，包含了兩個以上的基本元件，擁有多個不同元素的一個區域，簡單的 UI 模組。結合在一起有了新的意義，讓我們可以將它使用在每個場景中，很多個頁面都能使用到此分子元件  
  ![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687bEsXggmwOM.png)

實際範例：

- 第一個，是 List Item 的 TopView，其中包含 Text 以及 Container
- 第二個，照片資訊的顯示區域，其中包含 Image、Text，兩者疊在一起  
  ![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687XksIFsnQeO.png)

### Organisms

- 生物體，由 Atom、Molecule 幾個重複元件組合起來的部分，較複雜的 UI 顯示  
  ![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687094MWLWza3.png)

實際範例：  
清單裡面的 List Item 都是一個 Organism，由很多的原子和分子組合而成，成為一個體態資訊的顯示區域，而它們個別分開也都具有意義。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687O0iCuQJC8t.png)

### Templates

模板，沒有意義的一個大型區塊，只闡述層次與結構，了解實際的功能，不關注最終顯示的內容本身。良好的體驗由結構、操作流程去提供。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687VNPkSWylry.png)

實際範例：  
沒有 APP 實際的展示內容，只有排版與結構。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687QWI7Gn9Xca.png)

### Pages

頁面，爲 Template 的實體，設置實際的內容，並賦予意義，顯示最終的 UI 效果。也是分子設計的最終階段，與用戶互動的頁面，我們會在這裡驗證一切操作體驗是否正常，如果有問題，就需要回過頭去改善分子、有機體和模板，一層一層的優化，讓所有元素發揮作用，達成產品理想中的需求。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/201206877rBr4ksUED.png)

實際範例：  
以自身開發的產品為例，就是最終給使用者體驗的畫面。  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687jKUjFhwiiM.png)

### 完整分解

五個步驟的演變與開發過程  
![](https://ithelp.ithome.com.tw/upload/images/20231012/201206871bNbM2PrPh.png)

以上就是原子設計大概說明，這五個不同階段形成最終的產品呈現

- **原子** → 無法在進行拆解的 UI 元素，最基本的積木
- **分子** → 簡單的 UI 原子集合
- **生物體** → 複雜的元件集合，包含多個原子與分子，在 UI 上有獨特意義
- **模板** → 將元件放置在佈局中但不包含內容，只展示結構與層次
- **頁面** → 顯示真實的畫面內容，也是最終呈現給使用者的 UI，同時驗證實作彈性

> 可將原子設計理念視為一種意識模型，讓我們在開發時可同時創建複用元件、調整品牌設計，以及完成最終的 UI 畫面

## 元件維護

當我們專案越來越大時，為了讓每個畫面的元素都能夠重複使用，自定義的元件一定是非常多，我們如何在不是開發的環境下去瀏覽和測試這些元件，讓設計人員也能確認是否符合他的想法，這個時候需要像 Storybook 這類的輔助工具。

為什麼需要管理？公司內可能有多個專案，很多核心元件會經常使用，通常會自訂屬於自己的品牌風格，需要統一每個專案的元件。當系統建立起來後，工程師在開發前就能先打開 Storybook，快速查詢到指定元件，有需要再進行優化，也降低重工的機率，很好地維護專案品質。

而對於設計師來說，也能透過網頁直接瀏覽開發人員製作的元件庫，即時跟 Figma 等原先設計進行比對，直接操作元件，體驗 UI、UX，快速審查是否一致 ，有差異的話能即時地反映給開發人員，成為兩端的一個溝通管道。

### Widgetbook

Storybook 相關套件與工具，有 **widgetbook、storybook_flutter** 和 **flutterbook** 等等，目前以 **widgetbook** 為主流，品牌積極跟社群互動，也很常參與各大研討會，版本持續更新中，對於開發者來說是個讓人放心的選擇。以下使用它來說明：  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687j9xUdlN38d.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231012/201206875dhUrM1MaC.png)

工具特點：

- 介面乾淨整潔，速度快
- 可模擬在不同 Android、iOS 裝置上操作
- 調整動態參數，呈現不同的樣式與效果，即時瀏覽
- 支援 Codegen 生成，透過註解與 **build_runner** 實作
- 完整的開發文件，實作上簡單
- 提供 Widgetbook Cloud，可共享與協作
- 整合 **Figma**，無縫地確認設計與開發
- 開源專案，鼓勵大家進行貢獻

關鍵元素：

- WidgetbookCategory 分類
- WidgetbookFolder 資料夾
- WidgetbookComponent 元件
- WidgetbookUseCase 情節

以官方專案來說明，手動定義階層並生成一個簡易範例，讓大家更好理解。以底下範例來看，建立了一個 navigation 分類、widgets 資料夾、SearchField 元件和一個 Default 情節，UseCase 在實際場景的來看，輸入框可能就有正常、輸入錯誤、沒有內容的呈現樣式，這些都可以為元件定義，生成出來後我們就能操作一些設定和屬性來改變元件，進行快速瀏覽，了解實際狀況  
![](https://ithelp.ithome.com.tw/upload/images/20231012/20120687viYWMUf2yY.png)  
![Widgetbook](https://i.imgur.com/6G8FDva.gif)

提供了更多的 Widgetbook 範例，讓大家理解它的用途以及美妙之處  
![Widgetbook - 2](https://i.imgur.com/TuwVowz.gif)  
![Widgetbook - 3](https://i.imgur.com/AJewwIb.gif)

可以將 Widgetbook 運行在 macOS 和 web 上，當我們開發完之後，直接透過 CICD，部署一份 Flutter Web 版本的元件庫瀏覽器，讓開發者和設計師能夠直接透過網頁瀏覽，對於資訊與理解同步很有幫助。  
![Widgetbook - 4](https://i.imgur.com/dzs7KY9.gif)

解決問題：

- **設計一致性** → Widgetbook 本身就是專為 Flutter 開發與支援，確保多平台上有一致的外觀和體驗
- **效率提升** → 開發人員可以輕鬆地瀏覽元件，有效避免重複開發，讓程式碼更簡潔
- **完整協作** → 透過 Widgetbook Cloud 實現共享，也可以透過 Flutter Web 建立設計師與開發人員、客戶之間的溝通橋樑
- **動態驗證** → 隨意透過操作面板切換裝置、主題、語言、文字大小、動畫效果等等，立即反應實際結果

> **widgetbook** - <https://pub.dev/packages/widgetbook>

## 可能的問題

#### 時間

耗成本的初始工作就是建立品牌風格，需要由設計師專注地建構 Design System，包含 UI、UX、文件說明等等元素，而假設有風格的改版需求，升級工程應該是非常浩大。

#### 維護

即使前期花費時間和金錢成本來建立 Style Guide，如果沒有持續關注與更新，很容易就是三分鐘熱度，導致期望與實際越離越遠，對於小團隊來說比較不友善。這部分會需要持續的有特定人員負責，並在修改、更新工作上建立流程，並保持資訊同步。

------------------------------------------------------------------------

## 總結

本文跟大家分享了 Design System，由原子設計出發，這個概念從 2013 年到現在過了十年還是很值得學習，不管是不是 Mobile，在很多領域也都適用，它除了能幫助提升開發效率外，在維護、測試、可讀性上都有正面影響。最重要的還是要與團隊達成共識與默契，對於專案好，才是最適合的方式。

而有了元件庫之後，如何讓設計師即時了解開發結果，Widgetbook 或許能幫助到你們，更有效地解決問題，讓雙方保持資訊同步，不應該再像以前一樣請大家在手機和平台上測試囉，我們都需要適時地使用對的工具來輔助，讓團隊與產品運作一起成長！

希望有幫助到大家，任何有關 Design System 的想法都歡迎提出來一起討論。

## 相關資源

- <https://atomicdesign.bradfrost.com/table-of-contents/>

## Day 28: 制訂品牌風格， Design System 讓製作畫面變得很有趣！

- 發布時間：2023-10-13 23:09:09
- 原文連結：<https://ithelp.ithome.com.tw/articles/10339205>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 28 篇

![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687mZxZx14nlR.png)

如何在 Flutter 制訂一個有品牌風格的 Design System，讓我們的產品擁有特點，辨識度就非常重要，所以從基本的顏色、字體、文字大小、圓弧曲度、陰影、間隔尺寸等等，都需要有一套標準去管理，讓開發者能夠在順暢開發之餘還能保持程式碼的可讀性。

首先需要知道 **InheritedWidget** 是什麼？這裡再次簡單說明一下(詳細可閱讀另一篇介紹 MediaQuery 的文章，將連結附在下方)，它主要負責同一棵樹的數據共享，元件必須串聯在一起，有父子關係的情況下才能存取數據，Child 元件才能取得 Parent 元件的資料以及狀態。實際上會透過 context 在就是 Element 進行操作，從 Element Tree 去訪問上方或頂部的父元件，找到指定的 parent 後我們就能存取資料。

> 相關文章，讓你對 **InheritedWidget** 有更進一步的了解  
> [Day 7: MediaQuery 是什麼？很方便但如何正確在 Flutter 使用，順便跟你說它的缺點](https://ithelp.ithome.com.tw/articles/10325095)

我們需要使用 **InheritedWidget** 幫我們實現 Design System 的建置，讓所有元件都能監聽相關配置與狀態，一旦發生變動時收到即時通知，讓 UI 馬上進行更新，確保體驗完整。而這裡不需要使用到第三方套件幫忙，直接透過 SDK API 協助我們，以後不管切換到什麼類型的專案都能夠直接運用，不受其他東西影響，也能確保每個產品的風格一致性。

------------------------------------------------------------------------

## Custom InheritedWidget

首先自定義一個 **InheritedWidget**，此範例以 AppResource 命名，代表 APP 相關資源，它是我們唯一的入口。裡面新增了一個可變狀態 AppResourceData，它乘載著所有 Design System 需要的元素，也是我們要傳導的數據。接著是 InheritedWidget 需要的 Widget Tree，也就是 child 屬性，代表會在這棵樹上做數據共享。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687OxLnlg3D84.png)  
而此類不會被繼承、實作，所以精準定義為 **final**，並且註明為 **immutable**，防止隨意擴展。

其中 `of(context)` API，是 **InheritedWidget** 的默契，只要是存取狀態、資料都會定義此方法來讓開發者使用，直覺且可讀性高，其中使用到 `dependOnInheritedWidgetOfExactType()`，目的是尋找父類的 AppResource，從中取得 AppResourceData 資料，讓我們在開發時可以使用。也因為要訪問整棵樹，所以使用到了 **context**。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687Cno4f1LAyC.png)

`updateShouldNotify()` 很簡單，就是在什麼情境下會通知 Widget Tree 狀態有變動，可能需要做一些事情，這裡會拿到舊的狀態資料，進行比對確認是否為相同實體，不是的話就進行通知。這時我們就能拿到最新的元件配置，UI 可能因此也會不一樣。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687CBgeruhBXY.png)

當元件收到通知時就會觸發 `didChangeDependencies()`，因為元件依賴的狀態有更新，可以在這做一些處理，接著按照生命週期就會觸發 `build()`，進行 UI rebuild，可以根據新的數據給使用者不同的呈現。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687CND3t7AX20.png)

### 使用

在 UI Code 我們就能透過靜態方法存取狀態，跟使用 MediaQuery 和 Theme 的操作一樣。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687lDvNzlrSYh.png)

## UI Configuration Data

到了本文重點，我們透過 AppResource 要傳導的數據就是 AppResourceData。有兩個參數，我們首先需要 **context** 取得裝置資訊，進行後續的適配，為了確保顯示一致。第二個則是設計圖的長寬 **designSize**，這部分需要跟團隊的設計師配合，確保設計圖與開發相同。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/201206870C7ZMFLB2F.png)

1.  先看大概的樣子，我們裡面會有 Design System 定義的所有配置元素，例如：顏色、文字、間隔等等，根據你們的設計而定義出相對應屬性資料
2.  當我們拿到 context 後，就可以在內部進行裝置計算。一開始，先確認現在是 light mode 還是 dark mode，決定我們要使用的顏色配套
3.  接著根據設計圖大小與現有裝置比對，取得大小倍率，需要將此數值應用在每個配置，讓它們可以完整適應螢幕的顯示
4.  最後設定 props 條件，進行實體比對，這邊使用到 **Equatable** 套件。當然也可以不需要，自行撰寫 `== operator` 以及 `hascode` 實現，或是使用 **freezed** 套件，提供更多的 API 操作

``` dart
AppResourceData(
    BuildContext context, {
    Size designSize = const Size(375, 812),
}) {
    colors = context.isLight ? _AppColorsData.light() : _AppColorsData.dark();

    _scaleFactor = context.calculateScale(designSize: context.screenSize);
}

late final _AppColorsData colors;
late final _AppTypographyData typography = _AppTypographyData(scale: _scaleFactor);
late final _AppSpacingData spacings = _AppSpacingData(scaleFactor: _scaleFactor);
...

@override
List<Object?> get props => [
    colors,
    typography,
    spacings,
    ...
];
```

### 顏色

關於產品的顏色配置，可以透過自定義的 AppColorsData 去裝載，包含 light theme 和 dark theme，設置每個屬性顏色，所以當外部在取得時，就會根據當前裝置而取得對應實體，自然 APP 的顏色配置也會改變。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687JkQ9i86jbe.png)

跟大家分享一個技巧，可以定義內部 Design 類別都是私有的，只讓 AppResourceData 存取，這樣的好處是限制存取範圍，防止直接存取此類，因為我們要的是統一規範以及存取入口。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687MIm31nYib9.png)

在 AppResourceData 的匯入方式，代表在相同 library，可以正常存取 private class

``` dart
part '_colors.dart';
part '_typographies.dart';
part '_spacings.dart';
...
```

針對有關顏色色碼的部分，可以透過 `flutter_gen` 套件生成處理，不需要手動設置與維護，前提是需要有指定的 xml 檔案，當執行 `build_runner` 命令後，就會幫我們生成對應的 Color Class，命名與註解都很完整，使用上也很便利。切記盡量不要手動操作，很浪費時間也容易出錯。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687KXtrobh07o.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687rPbFmNJ9i3.png)

### 字體文字

關於字體與文字配置，多了一個參數，為計算過後的大小倍率，讓我們設計圖上的相關數值，可以根據倍率進行縮放，否則會造成不同裝置看起來的效果有些微差異。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/201206876XvQcMlNh7.png)

首先定義設計圖上有的文字選項，這裡使用了幾種 TextStyle，支援特定字體，並給予每種類型的大小、寬高，非常好維護

``` dart
...
late final TextStyle titleSm = _createFont(_titleSmFont, size: 16, height: 20, weight: FontWeight.w600);
late final TextStyle titleXs = _createFont(_titleXsFont, size: 14, height: 12, weight: FontWeight.w600);
late final TextStyle bodyLg = _createFont(_bodyLgFont, size: 16, height: 24, weight: FontWeight.w600);
...
```

![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687fpyRec30t4.png)

裡面根據倍率去調整 fontSize、fontHeight，並更新原本提供的 TextStyle，除了完成與設計圖上一致的 TextStyle 選項，同時也做了螢幕適配。

``` dart
TextStyle _createFont(
    TextStyle style, {
    required double size,
    double? height,
    FontWeight? weight,
}) {
    final fontSize = size * scaleFactor;
    double? fontHeight = height;
    if (fontHeight != null) {
        fontHeight = fontHeight * scaleFactor;
    }

    return style.copyWith(
        fontSize: fontSize,
        height: fontHeight != null ? (fontHeight / fontSize) : style.height,
        fontWeight: weight,
        ...
    );
}
```

### 間隔空間

關於很常用到的間隔空間，不管是元件大小、padding、margin 等操作，很常需要有固定好的數值來幫助我們，一旦我們跟設計圖掛鉤，就不需要擔心數值混亂以及輸入錯誤的問題，這也是 Design System 的好處。

以下配置了幾種設計圖出現的選項，跟文字一樣，需要根據 context 算出的裝置倍率，跟實際數值進行計算，確保間隔大小一致  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687sooyMehf5C.png)

當然我們也可以在 Class 撰寫一些便利的 API，以下範例就是直接取得 Padding 元件的參數 EdgeInsets，裡面配置的數值來源都是 AppSpacingData，哪裡定義好設計規範，其他地方就是乖乖遵守。可想而知，Design System 能延伸的東西很多  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687DcV3CdamaO.png)

## Common Widget

當有了 Design System 的 UI 配置零件後，我們要開始時做自己的基礎元件，包含很常用到的文字、按鈕、間隔、圖片，因為是基建可以讓命名與品牌掛鉤，可以使用 AppText、AppButton、XYZImage、XYZScaffold、AppGap、AppPadding 等等，透過原有 SDK 元件去實作，它們就是品牌的原子，所有的一切、UI 畫面都是由這些元素組合而成，也能進一步確保顯示上的一致性。

按照品牌元件庫，很輕易就能完成一個頁面，好處是不用擔心數值問題，按照設計規範好好開發就能達到效果，懶人又高效。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687QaQJ6ymfAU.png)

以範例的 AppGap 拿出來跟大家分享，沒有狀態可以使用 StatelessWidget，根據設計圖將各個間隔尺寸使用 AppSize 去管理，當開發在使用元件時，就可以透過自定義的命名建構去存取，以此範例就是使用指定間隔的 Gap 元件  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687KDSTNSdCQf.png)

AppSize 為 enum，根據設計圖上的尺寸規範定義種類，這裡也可以使用 xs、sm、md、lg、xl 去命名，主要根據團隊默契去選擇。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687z5SCn1sqNh.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687IArEF9VXEl.png)

當得知 AppSize 後就可以轉換成對應的 Gap 元件，其中數值透過額外撰寫的 extension api，取得我們先前定義的 spacing 設計圖配置，將這一切轉換流程都先在元件裡面撰寫完成，之後只需要呼叫使用就好了。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687FYA7W2JXCs.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687NspZRgPdv7.png)

而每一個元件都會使用到 AppResourceData，存取設計圖配置，統一從 **context** 與 `AppResource.of()` 入口操作。

> Gap 來自 **gap** 套件，好處是只需要給定數值，能自動適配 Column 和 Row。背後是自定義 的RenderObject，檢查父類方向在進行設置。讓開發者輕鬆使用，非常方便  
> <https://pub.dev/packages/gap>  
> ![](https://ithelp.ithome.com.tw/upload/images/20231013/201206877jIYEJ3ILr.png)

#### AppText

Text元件也一樣，我們根據設計規範去定義產品會使用到的幾種 Text 元件，所有的命名都跟 Guideline 相同，假如設計圖有 6 種字型大小，那整個 APP 就只會有這 6 種，使用上方便快速，避免開發者隨意定義文字元件導致難以維護的情況。當然範例中的參數，可以根據 UI 需求去設置，最基本的 Text 元件需要暴露哪些參數都由設計與開發決定。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687msL1LIrf3e.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687XQrzw8bNoI.png)

透過準備好的基礎元件庫，實作了一個產品需要的覆用元件，根據原子設計的概念，此元件就是一個 Organisms，由多個 Atom 和 Molecule 組合而成，讓它再多個頁面重複使用，提升開發效率。其中可以看到其中的很多地方都是基礎元件以及 AppResourceData 定義好的參數配置，完全不會有任何的 hard-coding 以及隨意撰寫樣子，一目了然也讓人放心。  
![](https://ithelp.ithome.com.tw/upload/images/20231013/20120687l8QqxlKbGk.png)

下方範例是沒有設計系統的撰寫方式，在沒有規範的情況下，會將代碼寫的很長，而這些在每個元件都重複了很多次，本身沒有意義也浪費時間，當其中某一個數值改變後，所有相關的元件都要手動修正。再來是沒有做到裝置適配，呈現給用戶的結果也會有差異。一經比較後，大家應該感受到差異性了  
![](https://ithelp.ithome.com.tw/upload/images/20231013/2012068738T9WW3EGC.png)

------------------------------------------------------------------------

## 總結

在實作 **Design System** 的幾個重點，在跟大家說明一次：

1.  首先創建基礎元件庫，也就是根本的原子，從原子在堆疊成分子元件，撰寫出支援產品風格的各種元件
2.  確保基礎元件與開發的所有元件，都要遵守規範，與設計圖定義的種類、尺寸完全一致。另外，裝置的適配也需要重視
3.  使用可提供幫助的元件 Package，例如本文提到的 **gap**，但一切根據需求決定使用，不要隨意盲從
4.  持續參考 SDK 元件的實作方式，或是第三方元件庫，適時優化 Design System，提升實作品質
5.  為了元件的 Accessibility，可以為元件加上 Semantics，也就是幫元件或 Widget Tree 描述本身的意義，讓輔助工具可以更快速的知道元件用途
6.  擁有屬於 Design System 相關檔案的目錄，成熟的話可以將它獨立出來，實作成一個 Package，提供給各個產品做使用

從上一篇的 **Atomic Design** 解說到本文的 **Design System** 實作，目的是要讓大家了解觀念和它們的重要性，當我們擁有自己的設計系統後，在開發 UI 上就變得輕鬆且容易，反而還會變得喜歡製作畫面，因為非常快速，體驗過後去回不去了。而當有了元件庫，公司的每個產品就能共用它們，有效避免重寫，一套支援多應用，管理上也非常方便，甚至大型團隊還會有負責 UI 相關的成員。

這時，再運用 Widgetbook 等輔助工具，讓非開發相關人員能即時瀏覽元件庫，體驗實際效果，多端的溝通可以保持頻率一致，善用工具真的有很多好處，幫助我們的產品更加完整。

希望本文有讓你學到東西，重視 Design System 確實讓開發生活更美好了，大家同意嗎？！

## 延伸閱讀

- [Day 27: 什麼是 Atomic Design 與 Design System？從 Flutter 快速掌握它們！](https://ithelp.ithome.com.tw/articles/10338681)

## Day 29: Dart 3 總複習，大家準備一下待會考試！

- 發布時間：2023-10-14 15:37:51
- 原文連結：<https://ithelp.ithome.com.tw/articles/10339438>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 29 篇

![](https://ithelp.ithome.com.tw/upload/images/20231014/20120687S7c66BJUBD.png)

延續在本系列開始的 Dart 3 解說與實用範例，目的是希望系列結束前能再讓大家複習和更熟悉 Dart 3 新版帶來的方便性，有效運用在目前的專案上，甚至能優化以前的程式碼，相信它們能夠給予一定的協助。

Dart 3 相關文章：

- [Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！](https://ithelp.ithome.com.tw/articles/10319282)
- [Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！](https://ithelp.ithome.com.tw/articles/10320379)

本文從第二篇的 Dart 3 文章接棒，繼續分享更多的實際案例與技巧，我們不只是要知道如何使用外，也要慢慢內化它，不靠死背記下來。而後面我也準備了小測驗，驗證大家對於 Dart 的熟悉程度，順便學習一些觀念。建議在閱讀文章的同時打開 IDE，同步跟著撰寫程式碼，這種方式學習速度會大大提升哦。

------------------------------------------------------------------------

## Example 10

1.  此範例使用了匿名參數、命名參數混合的 Record，在當中大家可以記住，前後順序可以隨便安排，不會影響使用方式。所以這裡使用了 `isMale` 命名參數，記得大括號包裹。
2.  接著**解構(Destructure)** student 物件，一樣順序沒有關係，直接根據自定義的命名變數來存取就可以了

``` dart
(int, String, {bool isMale}) student = (18, isMale: true, 'Yii');
print(student);
// (18, Yii, isMale: true)

final (isMale: isMale, age, name) = student;
print('$isMale, $age, $name');
// true, 18, Yii
```

## Example 11

這裡創建了一個方法 `waitTwoTask()`，返回一個 Record 結果，可以很簡單地處理多回傳值。以這個範例，當我有兩個非同步操作要同時處理時，就能使用 `waitTwoTask()` 協助我們，外部再順取兩個結果變數。

``` dart
final Future<int> futureAge = getAge();
final Future<String> futureName = getName();

final (int age, String name) = await waitTwoTask(futureAge, futureName);
print('$age, $name');
// 18, Yii

---

Future<int> getAge() async {
    return 18;
}

Future<String> getName() async {
    return 'Yii';
}

Future<(T1, T2)> waitTwoTask<T1, T2>(Future<T1> func1, Future<T2> func2) async {
    final data = await Future.wait([func1, func2]);

    return (data[0] as T1, data[1] as T2);
}
```

## Example 12

在 Dart 3 更新後，針對 Iterable 的 Extension 有在優化，新增了幾個常用 API，其中一個為 `indexed` getter，直接回傳一個 Record Iterable，內容為 index 和原有元素，多了索引讓我們在使用上更為方便。  
![](https://ithelp.ithome.com.tw/upload/images/20231014/20120687c3o0BVQF0r.png)

1.  此範例有一個 String List，透過 `indexed` 搭配 for loop，將每個 Record 拿出來處理
2.  第二個其實做法一樣，只是透過迴圈幫我們創建 List Item，最後使用 forEach 印出結果

``` dart
/// 1.
final students = ['Amy', 'Berry', 'Alan', 'Hank'];
for (final (index, element) in students.indexed) {
    print('$index, $element');
}
// 0, Amy
// 1, Berry
// 2, Alan
// 3, Hank

/// 2.
const names = ['Jack', 'Tina', 'Doodle'];
final result = [
    for (final (index, word) in names.indexed) '$index is $word',
];

result.forEach(print);
// 0 is Jack
// 1 is Tina
// 2 is Doodle
```

## Example 13

此範例使用到 **Switch Expression**，可以運用在日常的 Flutter 場景。目的是取得設備類型，所以首先有個 DeviceType enum，接著撰寫新的 BuildContext 擴充 API，根據目前的寬度根據每個設備條件來確認，完成一個 `deviceType` getter。接著在 UI code 就能透過 `deviceType` 處理每個場景。

``` dart
enum DeviceType {
  mobile,
  tablet,
  desktop,
  tv4k,
  giant,
}

extension BuildContextExtension on BuildContext {
    double get width => MediaQuery.sizeOf(this).width;

    DeviceType get deviceType => switch (width) {
        < 450 => DeviceType.mobile,
        < 800 => DeviceType.tablet,
        < 2160 => DeviceType.desktop,
        < 3840 => DeviceType.tv4k,
        _ => DeviceType.giant,
      };
}
```

![](https://ithelp.ithome.com.tw/upload/images/20231014/20120687CocGBdTeCY.png)

## Example 14

使用 **Switch Expression**、**Pattern Matching** 和 **Destructuring**。此範例需要解析 Json 並取得指定的 title 字串， 其中檢查格式是否有 name 這個 Key，而且 Value 不是空值，這時候就安全地拿 title 來使用，否則就拋出例外。

``` dart
final jsonMap = {
    'student': {
        'name': 'Jay',
    }
};

final title = switch (jsonMap) {
    {'student': {'name': final String title}} => title,
    _ => throw Exception('JSON is not correct.'),
};

print(title);
// Jay
```

![](https://ithelp.ithome.com.tw/upload/images/20231014/20120687BbvDudeFbJ.png)

## Example 15

在寫 UI 時，大家對於 **FutureBuilder** 應該非常熟悉，等待 future function 處理完後反應 UI，這時候針對 **AsyncSnapshot** 的各種狀態就能使用 Switch Expression 來協助，透過 when 進行第二層檢查，精簡、快速的處理成功、載入、錯誤三種情況，可讀性也因此提高了你說是吧。

``` dart
FutureBuilder<String>(
    future: Future.delayed(
        const Duration(seconds: 10),
        () {
            return 'Dart 3 is awesome.';
        },
    ),
    builder: (context, snapshot) => switch (snapshot) {
        final snapshot when snapshot.hasData => Text(snapshot.data ?? ''),
        final AsyncSnapshot<String> snapshot when !snapshot.hasError => const CircularProgressIndicator(),
        _ => const Text('Oops!')
  },
),
```

## Example 16

此範例使用 **sealed Class**、**If-Case Matching**、**Destructuring**，目的要快速的確認 sub class 並存取屬性。首先有一個 Car 跟 Tesla 兩個父子類別，經由 `getCar()` 取得子類別實體，這時候外部拿到的是 Car，需要檢查是否為我們要的 Tesla。

1.  第一個檢查，確認 Tesla，而且名稱為 Red，符合的話就印出 I am Red.。在這裡的情況都不會是 null
2.  第二個跟第三個實際上一樣，差別只是解構時對於 name 屬性的宣告方式。這情境不限制字串內容，只需確保它是 Tesla 子類別就好，最後就是將 name 印出來

``` dart
final car = getCar();
if (car case Tesla(name: 'Red')) {
    print('I am Red.');
} else if (car case Tesla(:final name)) {
    print('I am $name.');
    // I am Blue.
} else if (car case Tesla(name: final name)) {
    print('I am $name.');
    // I am Blue.
}

---

sealed class Car {
    final String name;
    Car(this.name);
}
    
class Tesla extends Car {
    Tesla(super.name);
}

Car getCar() {
    return Tesla('Blue');
}
```

## Example 17

從此圖範例可以表達 **Switch Expression** 的方便性，功用就跟 freezed 的 union-class 相同，針對多種情境和資料的使用方式都吃不啊多，透過 Dart 3 解構用法可以幫我們提高效率。  
![](https://ithelp.ithome.com.tw/upload/images/20231014/20120687iBynqyNYds.png)  
by Pascal Welsch

## Example 18

再次複習 `indexed` 新用法，有個 Map 需要有索引進行一些操作，搭配 for loop，在當中將每個 Item 轉成 Record 形式，並進行 MapEntry 解構，拿出 Key 名稱跟 Value 價格。在解構當中，方式不只一種，可以透\*\*前綴:\*\*取值，也可以透過命名參數取值，根據自己的使用習慣和規範。

``` dart
final cars = {
    'Tesla': 100,
    'Benz': 200,
    'BMW': 300,
};
for (final (index, MapEntry(:key, value: value)) in cars.entries.indexed) {
    print('$index - ($key, $value)');
}
// 0 - (Tesla, 100)
// 1 - (Benz, 200)
// 2 - (BMW, 300)
```

## Quiz 小測驗

#### 第一題

本題主要是考驗 **Pattern Matching** 中的 **If-Case Matching**，哪幾個 Pattern 會符合而且印出結果？

結果：

- 實際上 1、2 很簡單的根據是否 nullable 來辨識，第二個會符合
- 接下來 3 的寫法，雖然沒有問號，但它其實是 nullable，所以會被執行
- 最後 4 有加上問號，不過它一定有值，不可 null，所以不被執行

``` dart
int? age;

void main(List<String> arguments) {
    // 1.
    if (age case final int age) {
        printAge(age);
    }
    
    // 2.
    if (age case final int? age) {
        printAge(age);
    }
    
    // 3.
    if (age case final age) {
        printAge(age);
    }
    
    // 4.
    if (age case final age?) {
        printAge(age);
    }
}

void printAge(int age) {
    print('Age is $age.');
}
```

#### 第二題

對於以下的 **Records** 操作，它們個別印出什麼結果呢？

這個測驗過程很有趣，以 Record 來說，當我們有加上逗號，代表可能有多值要記錄，實際上就會是 Record，儘管只有一個參數。

``` dart
final one = 42;
print(one.runtimeType); // int

final one = (42);
print(one.runtimeType); // int

final two = (42,);
print(two.runtimeType); // (int)

final (int) two = (42,);
print(two.runtimeType); // (int)

final (int,) two = (42,);
print(two.runtimeType); // (int)
```

by Pascal Welsch

#### 第三題

對於以下的 **Destructuring** 操作，它們個別印出什麼結果呢？

首先提供一個 Record，它附有一個參數並多加了一個逗號誘導，當解構後的 Record 存取時，裡面的變數就是獨立的，在有逗號的情況下，元素就能期待它是原有型別。沒有逗號的情況下，取出的元素為 Record。

``` dart
final (int,) item = (42,);

final (one,) = item;
print(one.runtimeType); // int

final (two) = item;
print(two.runtimeType); // (int), Record!

final two = item;
print(two.runtimeType); // (int), Record!
```

by Pascal Welsch

------------------------------------------------------------------------

## 總結

相信跟著操作過這些實際例子的你們，應該已經懂得如何正確使用新的語法特性，其實不會很難對吧。也建議有時間的話去閱讀官方文件以及 Dart Repository，裡面有更詳細的設計說明。而現在社群很多人也已經有提供相關的 Dart 3 文章和影片解說，可以的話也鼓勵把開發經驗跟大家分享，多看多練習，你才會發現 Dart 語言其實越來越豐富、越來越強大了。

## 延伸閱讀

- [Day 1: 跟著我熟悉 Dart 3，這些高效語法你需要知道！](https://ithelp.ithome.com.tw/articles/10319282)
- [Day 2: 使用 Dart 3 改善我們的開發習慣，更多範例與技巧分享！](https://ithelp.ithome.com.tw/articles/10320379)

## Day 30: The End to Start, Be a Contributor

- 發布時間：2023-10-15 20:43:12
- 原文連結：<https://ithelp.ithome.com.tw/articles/10339903>
- 系列標記：探索 Flutter 由裡到外，三十天帶你前往進階系列 第 30 篇

![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687qboehPkgez.png)

嗨，大家好，再次自我介紹，我是陳虔逸、Yii Chen，一位 Flutter 愛好者以及推廣者，專注跨平台開發，除了投入技術寫作外，也是活躍講者。擁有 7 年 Mobile 經驗，開發過大大小小的 APP，從 Android、iOS 到近期深耕 Flutter，包含結合IOT、藍芽BLE、購物、交友、健身等等應用，致力於開發出高品質且體驗豐富的產品。除了本業外，也擔任 Flutter Taipei Organizer，經營四千人的開發社團，鼓勵大家參與社群，並擁抱開源，擁有正向積極的影響力。

很開心能夠再鐵人系列的最後一篇見到你/妳，沒想到時間過得這麼快。如果你是從一開始追到最後，請私訊我，我會給予一個特殊獎勵，也感謝關注。

從標題得知，鐵人賽系列的結束，對我來說是個開始，為什麼呢，讓我跟大家分享一下。

相信大家都知道 Flutter 從 2017 年亮相到今年才短短幾年，六歲而已(補充一下，Dart 很早期就有了，10/10 誕生，目前已經 12 歲囉，讓我補個：生日快樂 Dart !)，Flutter 對於原生 Android、iOS 或其他領域還算是小孩子，是一個較新的技術，所以相對的資源、開發人員比較少，尤其在台灣，人數當然是更少，前期願意嘗試的開發者不多，不過這兩年，越來越多的原生朋友轉換到 Flutter 領域，越來越多人開始了解 Flutter 是什麼，很多學生首次接觸 Mobile 開發就是 Flutter，很多企業也使用跨平台技術來提高效率與節省成本，各項數據都逐年成長中，對於一個早期加入人員，我個人是很感動也很開心。

隨著 Dart 3 在五月的穩定釋出，也代表 Flutter 專案、產品的穩定性提升，少數符合 100% sound-null safety 的語言，除了安全風險降低之外，編譯也更有效率、速度更快，包含幾種新的語言特性，可以看到官方對於大家的心聲從不忽視，持續的改變為了讓開發者能受益，讓社群對於 Flutter 與 Dart 團隊都很放心也很有信心。

目前 Flutter 套件平台 **[Pub.dev](https://pub.dev/)**，也有上萬個套件可以使用，前 1000 個主流選項都已經支援 null safety 了，讓所有開發者在選擇上都不用擔心，相信使用了排名前面的這些套件，應該能幫你解決大部分的問題與功能需求。也鼓勵大家能給予套件按讚，每個維護者都很辛苦，有不足的地方也多多提 issue，讓大家幫忙改善。

原先的一些劣勢，在這兩年開始已經完全不同了，Flutter 目前擁有 Github 開源專案的前五名星星數，截至今天為止為15萬7千多(快9萬個Issue，有76102修復)，這些都是官方與社群共同努力的結果，可想而知有多少人在關注 Flutter，使用它來開發專案與產品，而在 Stackoverflow 每年的調查報告裡，今年的 Other frameworks and libraries 分類，Flutter 正式進入前十名，非常值得開心的一件事，也是第一次超越相同領域的 React Native，值得紀念的一刻。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687IziYIsNRVU.png)  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687K81XqKfcC6.png)

> - [Flutter](https://github.com/flutter/flutter)
> - [Stack Overflow Developer Survey 2023](https://survey.stackoverflow.co/2023/#worked-with-vs-want-to-work-with-misc-tech-worked-want)

在 2023 Flutter Strategy 裡面有提到，截至今年 1 月，Play 商店中有超過 700,000 個 APP 是使用 Flutter 開發的，而在新應用中，有五分之一使用 Flutter，比其他跨平台框架的總和還要多，而到目前為止，Flutter 開發者有六百多萬人以上，總共已發布了1百1十萬個APP。就我了解，除了歐美，目前印度、印尼、非洲等國家都有大家發者持續加入，當地很多學校、新創都開始使用 Flutter 開發產品，也進一步幫助 Flutter 的發展，影響力擴大中。從中可看出目前對於市場與開發者來說，Flutter 這項技術是首選或是一個更好的選擇。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687D1phIuVsLB.png)

> [2023 Flutter Strategy](https://docs.google.com/document/d/e/2PACX-1vRknZ4Jkc-pWSMsDDyKwMrry7k2BSL_I94JCCQrg8FiHuy4fcypkgIVFbQVKPmzDQHfd20uZf2rFiXP/pub)

對於 Android 用戶，如果想要知道手機內有沒有 Flutter APP，可以下載 Flutter Shark，它可以幫你偵測，並列出 Flutter 與 Dart 版本，接著還能列出 APP 有使用到的套件，很有趣且資訊很裸露的應用。iOS 用戶就沒辦法了，裝置無法做這些事情。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687lhefBMgVcy.png)

> [Flutter Shark](https://play.google.com/store/apps/details?id=com.fluttershark.fluttersharkapp&hl=en_US)

目前市場上知名的 Flutter App，以下列出一些給大家參考：

#### Google

- Google Ads
- Google Pay
- Google Analytics
- Google Classroom
- Google Play Console
- Google Cloud
- Youtube Create
- Google Earth

#### Other

- Wolt(芬蘭的 Uber Eat)
- Grab(東南亞版本的 Uber)
- NuBank(巴西的銀行 APP)
- SNCF Connect(法國的交通 APP)
- CA24(法國的銀行 APP)
- Binance(Web3 APP)
- Apex(Web3 APP)
- …

#### Flutter Consultant

官方新增了 Consultants 頁面，列出國際上聲量好且穩定的 Flutter 團隊與公司，例如：VGV、gskinner、Somnio、BAM、IBM、Rebel App Studio 等等，它們專門協助客戶解決產品與開發問題，其中也有包含開發者培訓。其中 IBM 在近幾年運行了 IBM Flutter 團隊，其中提到選擇 Flutter 的主要原因是開發速度與品質，尤其讓團隊在兩週內發布西班牙的新聞產品。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687KNICT8U64j.png)

------------------------------------------------------------------------

OK，前面幫大家補充了 Flutter 目前的現況，回到主題，為什麼要當個貢獻者？為什麼想要參與社群？很多人問：『你都不會累嗎，都沒有休息出去玩為的是什麼？』

這些問題其實很好回答，就是，因為我喜歡，喜歡開發 Mobile，喜歡 Flutter 這個技術的理念與魅力，所以平常很自然的都會在 Medium 撰寫學習記錄、分享開發經驗、蒐集最新消息，對我來說花這些時間都很值得，其實累不算什麼。因此在 8 月多的時候，看到了鐵人賽的資訊，其實原本沒有特別興趣，因為平常都有在輸出，只是平台不同而已，直到 9 月比賽快開始前夕，看到 Mobile 領域的參賽者，Flutter 在其中比原生領域的人還少一點，此時我心中覺得不行，需要更多內容讓大家瀏覽，讓 Flutter 被大家了解的機會多一點，所以就報名了，至於有沒有得名、有沒有獎勵不是那麼重要。

到了最後一天，鐵人賽的參賽心得呢，我個人覺得是時間，剛好這兩個月除了工作之外，還有 Side Project 產品、Flutter Taipei 社群經營、準備研討會等等，過程只能說刺激有趣，當然也是累呀哈哈。鐵人系列的主題在一開始就差不多都制定下來，挑選與撰寫的方向，主要朝著能幫助其他開發者為主，從基本觀念、源碼分析、動畫細節、開發技巧、狀態管理、自動化測試、設計系統，最終兩個月也順勢生出了四十幾篇文章，其他部分(架構、安全性、CICD、代碼分析..)後續會再其他平台釋出，大家可以關注一下，記得追蹤 Flutter Taipei Medium，掌握最新消息。

其實開發一個 APP 需要的元素有很多，不單單只是刻出畫面、完成功能，最終還是追求一個好的產品，有質感讓人喜歡的產品對我來說更為重要，這些是 for 使用者端，那我們開發者呢，當然要想辦法將無聊、重複的任務轉換為自動化，如何讓團隊很順暢有效率的開發 Flutter APP，就是另一個重點了。希望分享的內容有幫助到大家，從系列主題來看，三十天其實遠遠不夠，目的是期望能夠引導每位開發者往進階的道路前進，持續提升相關技能，不再只是敲敲鍵盤的工程師，我想當你願意點進來此系列，也就代表你自己也願意成長，非常歡迎有任何想法都提出來討論，我們能夠一起交流一起前進，我很樂意跟大家互動。

那前往進階的道路上會有什麼好處？你說反正公司不會在意這麽多，底下的人有完成功能、完成任務就好，客戶開心大家都開心，哪有時間寫測試或是在意要不要成長？說的也沒錯，當然身為員工做好本分是基本，賺錢養家才重要對吧？但提升自己有壞處嗎，當然沒有，以分析源碼為例，了解官方和其他開發者的寫法，可以促使我們更清楚背後的運作原理，資料的流動。以 Flutter 來說

1.  **Widget** 本身是什麼？
2.  **BuildContext** 實際上 Element，所以元件可以在樹上訪問 Parent 做一些操作，存取到 **InheritedWidget**。那 **RenderObject** 如何實作？
3.  **Element**，`updateChild()` 在不一樣的情境下做了什麼事情
    1.  原本沒有 Widget 下一幀有
    2.  原本有 Widget 下一幀沒有
    3.  原有 Widget 更新配置
    4.  原有 Widget 更新成不同類型的 Widget
    5.  原有 Widget 沒有變化
4.  **Layout Flow**，”constraint go down, size go up, parent set position”，在 build 和 layout 階段使用 `One Pass algorithm` 的次線性性能是 Flutter 一個重要的優化
5.  **Rendering Pipeline**，Animate → Build → Layout → Paint → Layer Tree → Compositor → Raster → Pixel，到最後執行 `finalizeTree()` 清理資源
6.  ……

當我們了解其中概念，可以很好地幫助到開發，發生問題時知道原因為何，不會覺得莫名其妙為什麼。當聊到相關話題時，我們能參與並分享一些想法與經驗，尤其是面試，應該沒有人不需要吧，除了過往的產品經驗外，對於所在領域的了解程度是個很大的考量，在不在意每個需求和問題，它們為何出現、如何解決，只有我們深入去瞭解 Dart 與 Flutter 後才能正確地給予回覆，除了 SDK 本身，有關安全性、自動化流程、Design System、測試技巧等等，當主動提出這些想法，能跟工程師、主管聊天的時候，對於期望的薪資和位置應該就不是太大問題了，對方也會了解求職者的企圖心與學習心態，重點還是在於有沒有重視自己的能力，和正在追求的目標，所給予的眼光會有所不同。

------------------------------------------------------------------------

有些人可能為了想貢獻社群而參加比賽，有的人想有個鐵人紀錄而參加，也有的人單純想分享經驗，這些出發點都很棒，我自己本身很敬佩願意分享的開發者，這些需要經驗和時間才能產出的內容，對於社群和讀者來說是個很棒的學習資源。而在這裡我也整理了幾個分享與撰寫文章的小技巧：

#### 避免長度過長

在這個時代，現在短影音的流行，每個人都在滑抖音、Short，大家已經習慣短時要間取得重點，當然遮裡不能相提並論，族群、類型都不同，而技術文章也有它本身的價值，我的個人經驗與目前作法，維持文章在15分鐘內能閱讀完，或是兩個主題內，但最終還是取決於對內容的敘述想法，而時常在 Medium 上會有大概標示，如果內容很多也可以區分的話就盡量分為 part1 ~ partX，除了能讓人比較沒壓力的閱讀之外，讀者也會覺得有完成一件事情的感覺，過程中會得到成就感，而不是感到很長的文章就選擇放棄。

#### 重視舒適性

撰寫的過程中，標點符號的使用很重要，跟說話一樣，該斷的時候斷，避免一直使用逗號去分隔，當轉換情境、話題的時候就使用空行進行分隔，讀者也能順勢休息，這時候可以喝個水或是上個廁所，淺意識其實會有提醒作用，或是並將此段落記錄下來，下次打開文章時可以很快地掌握相關記憶。

另外圖文交錯也是一個方式，當有可以代表話題以及段落的東西就能放在後方，除了讓讀者想像外也能實際了解作者在分享的內容，有幫助記憶的效果。尤其時內容抽象感很重的話，例如：說明專案架構時需要的目錄架構圖、IAP 購買流程圖、體重紀錄後分析的時間圖表等等，圖像能讓讀者增加好感，不只是參考其他文章或文字說明外，同時也會覺得作者很用心。

#### 圖片與影片

上一項提到了舒適性，跟圖片和影片有大大關係，內容必須確保清晰且關注重點，如果再說明程式碼的狀況，就專注特定區塊即可，不需要將旁邊不相關的畫面擷取進來，有效增加閱讀體驗。而如果操作流程是持續動作的話建議錄影，可以的話進行影片裁剪，只保留重點片段就好，保持一個重點，就是簡潔有力。除了影片外可以將它轉換成 GIF，優點是體積比較小，因為平台通常會限制容量，不可能讓使用者隨意上傳大型檔案，例如：Medium 最大允許為 5mb。除此之外，GIF 還支援自動循環重播，這是一個很棒的讀者體驗。

> 個人常用的工具 **Gifski**，除了能裁剪之外，還能調整尺寸、幀數、品質，可以很好地控制輸出大小，生成速度也很快，個人非常推薦

#### 引用參考

我們總是站在巨人的肩膀上去學習，公開的資源非常多，有課程或是閱讀其他開發者的經驗，加上自己的想法後產出屬於的自己的知識，建議如果想參考其他作者的圖片或文字，都要加以調整再撰寫，圖片也是，可以內容差不多但是要以自己的繪製版本呈現，就跟寫論文一樣，我們被允許參考但同時也要給予尊重，最起碼基本的 shout out 要有，或是標示出處，在結尾提供相關連結，良好的開源文化需要被建立，需要你我一起維護它。

------------------------------------------------------------------------

為什麼想貢獻社群？其實從幾年前開始我開始發布一些 YT 教學影片，從 Android、iOS 到 Flutter，也有持續在寫東西。一開始只是為了學習記錄，遇到了很多開發上的問題，對於記性不好的人這是一個很棒的方式。而另一個想法是覺得這個問題應該有其他開發者也會遇到，如果有人因此受益、能幫助到他們，那很棒，沒有的話也沒關係，反正就是自己的筆記而已，沒有想這麼多。當紀錄越來越多後，開始收到很多開發者的訊息，它們留言跟我說謝謝，還會私訊跟我聊天，甚至就因此認識變朋友了。從來沒想過說自己能間接影響到其他人，幫助到他們，尤其很多還是國外朋友，從中我獲得非常大的成就感，覺得原來持續做的事情其實很有價值，也讓我保持著這樣的心態想要持續分享。

↓ 結果以前發布的 Spotify 運行問題，是現在最多人關注的文章，因為只要用 M1 的朋友都會遇到，內容只花了十分鐘就完成.. 從這個時候發現，原來自己也能有正面的影響力  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687ztjMH0FXOI.png)

↓ 早期的 YT 影片，每週上一個原生教學，以前真的很生疏，是個累積經驗的過程，不時會收到一些道謝留言  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206875qc5YkP7qu.png)

↓ 很多人找到我的 IG 跟我聊天。也有國外開發者使用了套件，並跟我說聲感謝，每次收到都覺得感動  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206874hs4MDocBP.png)

↓ 分享了 Widgetbook 文章，關於元件庫的維護，結果創辦人來留言，願意給予使用與分享上的幫助。受寵若驚的一刻，接下來可能會合作，可以期待  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687qZlffM9Ctt.png)

#### 經營社群

從二月開始，想要經營社群，因為看到國外的社群氛圍，這兩年辦了非常多大型活動，包含歐美、印度、非洲、杜拜等等國家，很多開發者都願意分享自身經驗，聚會都很多人參與也很有趣，這時就覺得台灣也應該這樣。也因為當時台灣還沒有活絡的 Flutter 社群，沒有相關活動能夠參與，我主動跟 GDG Taipei 聯繫，後來就有了每個月的 Flutter Meetup，到十月已經是第九場了，這過程讓人感到欣慰。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687IAVwcyUaEB.png)  
(Kevin, 斌權, 志剛, 家豪, Yii)

而在年中 Flutter Taipei 與我們聯繫上，因為因緣際會，順勢承接這個元老 Flutter 社群，跟我的初始想法一致，讓我們現在能夠有更大的影響力去推廣 Flutter。成員因為喜歡而聚在一起，即便很累也願意做這件事，不覺得很熱血嗎？！初代成員幾乎都是女生成員，真的很酷很棒，同時感謝他們的努力，我們也才能夠延續 Flutter Taipei 的精神。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687xIHsosJ39P.png)  
(Flutter Taipei)

也因為社群接觸到了認識很多開發者、專家，以及遇到很多新的機會。例如在 Firebase 影片上看到的 **Andrea Wu**，一位負責 Remote Config 的工程師。她對於工作的熱誠，做著自己喜歡的事情，那種滿足從語氣中能感受得到。跟她互相分享生活以及想法，很感激那次的機會，受鼓舞很多。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687sqPcFrkT9t.png)  
(Yii & Andrea)

受邀到 Google IO Extended 上分享 Dart 以及 Flutter，很棒的體驗，同時認識了 Firebase GDE - Richard 大，分享了很多投入社群的想法，也鼓勵我繼續朝著目標前進，真的非常感謝。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/201206871qAJvfJa5E.png)

參與今年的 **COSCUP**，與 GDG Taipei 合辦，學習擺攤經驗，認識許多新朋友與開發者，鼓勵大家多多參與。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687747RIpkCqE.png)  
(小啄 & Dash)

而在近期也獲得官方團隊給予的獎勵，竟然收到了 Dash 娃娃，沒有想過這一天什麼時候會到來，這是無法預期的一件事情，也是身為 Flutter 開發者的榮耀，對我來說非常重要，也很激勵我繼續經營社群，推廣 Dart 與 Flutter。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687TcNQ9ZYNzR.png)  
(Flutter Swag)

以上分享的種種，說了非常多，都是基於接觸社群後出現的事情和機會，很多事你無法預測，只要跟著心中想法去前進，好像自然就會到達新的目的地，這些就是社群帶給我的好處，從中受益良多。

#### Input then Output

以前剛開始進入程式領域的時候，那時的我擁有什麼知識或想法都覺得很寶貴，它屬於我的所以完全不想讓別人知道，因為怕被別人學走，花了這麼多時間結果被人家抄襲，也導致那時候比較封閉，學了一些東西後就覺得很厲害。殊不知，當我們沒展現出來的時候，根本不會有人知道原來你懂，就像自嗨的感覺。所以為什麼鼓勵大家不管在什麼領域、在公司，有想法就應該勇於提出，團隊才能即時將你的意見納入考量，可能你想到的其他人沒想到，同時大家也能知道你的用心，在群體中的被信任感也會隨之提升。

而自從接觸社群，開始跟國外開發者交流後，才發現原來歐美那邊的開源氛圍這麼的棒，大家很主動地會在社交平台上分享，幫忙轉發，從任何技術的大小事、開發經驗到公司使用到的技術，積極參與研討會，並花很多心力在開源專案上，讓我學到非常多。這時候也才知道，原來厲害的開發者和專家，它們不僅自身要求高以外，對於開源的影響力越大，保持穩定的輸入和輸出。當然不是每一位都如此，但至少大家秉持一個信念，就是不要浪費時間在重複的事情上，我們開源就是為了要解決問題，一起討論一起維護，改善領域技術，最終大家一起成長，並持續邁步前進。

對於開源專案和資源，我大部分都將所有的資訊開放到 Github 上，也製作了 Flutter 相關套件，身為作者，維護是一件辛苦的事情。初衷是需要，所以製作出來希望能夠幫助其他開發者，在大家使用後，社群會許願很多很棒的功能，也幫忙找出問題，本身是非常感謝。但實際上大家都有工作，沒有報酬的關係，要持續的維護以及更新真的有點難，比較難排出時間去處理，難免長時間下來到後面會有點無力。因為自身理解，所以想跟大家分享，每個人都應該尊重作者與維護者，事實的給予讚美和捐助，對於環境才有正向的循環，也能讓相關人員更有動力的去前進。

以下是中國 Alex 大，接手 Dio 後的每日行程，很讓人敬佩的一位開發者。  
![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687P7iNHJaW3J.png)

此時，對我來說，鐵人賽分享只是一個很短暫的過程，跟大家每天奮鬥發布文章確實熱血。接下來會一樣會持續輸出，相關內容都會轉換為英文上傳到 Medium，不管國內外開發者都能接觸到，有什麼想法都能到上面留言給我。除此之外，還有 IG 跟 Twitter，主要分享即時的開發消息和一點點工程師生活。

Flutter 目前持續成長中，這個技術在全世界，以及跨平台領域給予大家深刻的印象，它的影響力很廣，也確實能透過它解決問題、實踐心中想法，越來越多人加入後，已經逐漸成為主流了。不過台灣目前公開的資源有限，還需要更多朋友投入進來，不管是推廣技術、文章分享、參與實體活動等等，都需要大家的協助。只要你有想盡一份心力，都歡迎跟 Flutter Taipei 或是我聯繫，可以在官方 Medium 分享經驗，或是成為活動志工，相信加入後絕對能感受到不同的體驗，並從中獲得成就感。我們一起加油，一起成長！

------------------------------------------------------------------------

現在 Flutter Taipei 定期會跟 Flutter 官方互動，了解正在執行或即將釋出的資訊，我們都會發佈在 FB 社團。目前每個禮拜有 Live Coding、每個月月底有 Flutter Meetup(接下來有可能請到國外開發者來分享)，而在年底我們預計會參加 Google DevFest 2023，到時候內容有工作枋和演講議程，歡迎開發者來一起參與，保證不會失望。以下是 Flutter Taipei 相關連結

- Facebook: <https://www.facebook.com/groups/flutter.taipei>
- Medium: [https://medium.com/flutter-taipei](https://medium.com/flutter-taipei?fbclid=IwAR2u2Th7yqDR9jCwwxC6v6gnjNUDZ6r3ZHzIty8bu1SsR4tZDNrxNptZd0s)
- Discord: [https://discord.gg/wssuh9kujB](https://discord.gg/wssuh9kujB?fbclid=IwAR1hnpXG2K5hgj-PIOlND7ESFUQ-_pYgkDTTw4uYqPxys-DSjWt5GWvD_OE)
- Twitter: [https://twitter.com/FlutterTaipei](https://twitter.com/FlutterTaipei?fbclid=IwAR1AhW-uUUc18gfAagHYAgGLbwRT80zx9ABkJY4LIrGmKgMBkRFUEk18_DE)

附上我的相關資訊，也歡迎交流和追蹤：

- Medium: <https://yiichenhi.medium.com/>
- Github: <https://github.com/chyiiiiiiiiiiii>
- Instagram: <https://www.instagram.com/flutterluvr.yii/>
- Twitter: <https://twitter.com/yiichenhi>
- Linkedin: <https://www.linkedin.com/in/yiichenhi/>
- Youtube: <https://www.youtube.com/@a22601807/videos>

![](https://ithelp.ithome.com.tw/upload/images/20231015/20120687COfrQk73Wc.png)
