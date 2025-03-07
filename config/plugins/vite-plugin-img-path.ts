import path from 'path';

/**
 * Plugin to handle @img alias replacement based on file nesting level
 */
export default function imgPath() {
  return {
    name: 'vite-plugin-img-path',
    enforce: 'pre',
    transform(code: string, id: string) {
      // Обрабатываем только HTML, CSS и SCSS файлы
      if (id.endsWith('.html') || id.endsWith('.css') || id.endsWith('.scss')) {
        const srcDir = path.resolve(process.cwd(), 'src');
        const imgDir = path.resolve(srcDir, 'img');
        const fileDir = path.dirname(id);

        // Рассчитываем относительный путь от файла к папке img
        let relativeImgPath = path.relative(fileDir, imgDir);

        // Если это SCSS файл, учитываем что он будет скомпилирован в dist/css/app.css
        if (id.endsWith('.scss')) {
          relativeImgPath = '../img';
        }

        // Заменяем @img на относительный путь
        return {
          code: code.replace(
            /url\(['"]?@img\/((?:[^"')]*\/)*[^"')]*)['"]?\)|@img\/((?:[^"')]*\/)*[^"')]*)/g,
            (match, urlPath, directPath) => {
              const imgPath = urlPath || directPath;

              // Обрабатываем url() конструкции
              if (match.startsWith('url')) {
                const hasQuotes = /url\(['"]/.test(match);
                return `url(${hasQuotes ? '"' : ''}${relativeImgPath}/${imgPath}${hasQuotes ? '"' : ''})`;
              }

              // Прямая замена @img
              return `${relativeImgPath}/${imgPath}`;
            }
          ),
          map: null
        };
      }
      return null;
    }
  };
}
