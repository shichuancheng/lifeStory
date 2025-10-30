// PDF导出工具
export class PDFExporter {
  async exportBiographyToPDF(
    title: string,
    content: string,
    options: PDFExportOptions = {}
  ): Promise<void> {
    try {
      // 这里应该集成 jsPDF 或其他PDF生成库
      // 目前提供模拟实现
      
      const defaultOptions: PDFExportOptions = {
        format: 'A4',
        orientation: 'portrait',
        fontSize: 12,
        fontFamily: 'SimSun',
        margin: 20,
        lineHeight: 1.6,
        ...options
      };
      
      // 模拟PDF生成过程
      await this.simulatePDFGeneration(title, content, defaultOptions);
      
      // 实际实现应该使用类似以下的代码：
      /*
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: defaultOptions.orientation,
        unit: 'mm',
        format: defaultOptions.format
      });
      
      // 设置字体
      doc.setFont(defaultOptions.fontFamily);
      doc.setFontSize(defaultOptions.fontSize);
      
      // 添加标题
      doc.text(title, defaultOptions.margin, defaultOptions.margin);
      
      // 添加内容
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, defaultOptions.margin, defaultOptions.margin + 20);
      
      // 保存文件
      doc.save(`${title}.pdf`);
      */
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error('PDF导出失败，请稍后重试');
    }
  }
  
  private async simulatePDFGeneration(
    title: string, 
    content: string, 
    options: PDFExportOptions
  ): Promise<void> {
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 创建模拟的PDF内容
    const pdfContent = this.formatContentForPDF(title, content, options);
    
    // 创建下载链接
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`; // 模拟文件，实际应该是.pdf
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  private formatContentForPDF(
    title: string, 
    content: string, 
    options: PDFExportOptions
  ): string {
    const header = `${title}\n${'='.repeat(title.length)}\n\n`;
    const formattedContent = content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
    
    return header + formattedContent + '\n\n生成时间: ' + new Date().toLocaleString();
  }
}

// Word文档导出工具
export class WordExporter {
  async exportBiographyToWord(
    title: string,
    content: string,
    options: WordExportOptions = {}
  ): Promise<void> {
    try {
      // 这里应该集成 docx 库
      // 目前提供模拟实现
      
      const defaultOptions: WordExportOptions = {
        fontSize: 12,
        fontFamily: '宋体',
        lineSpacing: 1.5,
        pageMargin: 2.54,
        ...options
      };
      
      await this.simulateWordGeneration(title, content, defaultOptions);
      
      // 实际实现应该使用类似以下的代码：
      /*
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32
                })
              ]
            }),
            ...this.contentToParagraphs(content)
          ]
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.docx`;
      link.click();
      */
      
    } catch (error) {
      console.error('Word导出失败:', error);
      throw new Error('Word导出失败，请稍后重试');
    }
  }
  
  private async simulateWordGeneration(
    title: string,
    content: string,
    options: WordExportOptions
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const wordContent = this.formatContentForWord(title, content, options);
    const blob = new Blob([wordContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`; // 模拟文件，实际应该是.docx
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  private formatContentForWord(
    title: string,
    content: string,
    options: WordExportOptions
  ): string {
    const header = `${title}\n\n`;
    const formattedContent = content
      .split('\n\n')
      .map(paragraph => `    ${paragraph.trim()}`) // 添加段落缩进
      .filter(paragraph => paragraph.trim().length > 4)
      .join('\n\n');
    
    return header + formattedContent + '\n\n\n生成时间: ' + new Date().toLocaleString();
  }
}

// HTML导出工具
export class HTMLExporter {
  async exportBiographyToHTML(
    title: string,
    content: string,
    options: HTMLExportOptions = {}
  ): Promise<void> {
    try {
      const defaultOptions: HTMLExportOptions = {
        theme: 'classic',
        includeCSS: true,
        responsive: true,
        ...options
      };
      
      const htmlContent = this.generateHTML(title, content, defaultOptions);
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('HTML导出失败:', error);
      throw new Error('HTML导出失败，请稍后重试');
    }
  }
  
  private generateHTML(
    title: string,
    content: string,
    options: HTMLExportOptions
  ): string {
    const css = options.includeCSS ? this.generateCSS(options.theme, options.responsive) : '';
    const bodyContent = this.formatContentForHTML(content);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${css ? `<style>${css}</style>` : ''}
</head>
<body>
    <div class="biography-container">
        <header class="biography-header">
            <h1 class="biography-title">${title}</h1>
            <p class="generation-info">生成时间: ${new Date().toLocaleString()}</p>
        </header>
        
        <main class="biography-content">
            ${bodyContent}
        </main>
        
        <footer class="biography-footer">
            <p>由 忆述 AI传记生成器 创建</p>
        </footer>
    </div>
</body>
</html>`;
  }
  
  private formatContentForHTML(content: string): string {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // 检查是否是章节标题
        if (paragraph.startsWith('第') && paragraph.includes('章')) {
          return `<h2 class="chapter-title">${paragraph}</h2>`;
        }
        return `<p class="paragraph">${paragraph}</p>`;
      })
      .join('\n');
  }
  
  private generateCSS(theme: string, responsive: boolean): string {
    const baseCSS = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: "Microsoft YaHei", "SimSun", serif;
        line-height: 1.8;
        color: #333;
        background-color: #f9f9f9;
      }
      
      .biography-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        min-height: 100vh;
      }
      
      .biography-header {
        text-align: center;
        padding: 40px 20px;
        border-bottom: 2px solid #eee;
      }
      
      .biography-title {
        font-size: 2.5rem;
        color: #1a1a1a;
        margin-bottom: 10px;
        font-weight: 700;
      }
      
      .generation-info {
        color: #666;
        font-size: 0.9rem;
      }
      
      .biography-content {
        padding: 40px;
      }
      
      .chapter-title {
        font-size: 1.5rem;
        color: #1677ff;
        margin: 30px 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .paragraph {
        margin-bottom: 16px;
        text-indent: 2em;
        font-size: 1rem;
      }
      
      .biography-footer {
        text-align: center;
        padding: 20px;
        border-top: 1px solid #eee;
        color: #999;
        font-size: 0.8rem;
      }
    `;
    
    const responsiveCSS = responsive ? `
      @media (max-width: 768px) {
        .biography-container {
          margin: 0;
          box-shadow: none;
        }
        
        .biography-header {
          padding: 20px;
        }
        
        .biography-title {
          font-size: 2rem;
        }
        
        .biography-content {
          padding: 20px;
        }
        
        .chapter-title {
          font-size: 1.3rem;
        }
      }
    ` : '';
    
    return baseCSS + responsiveCSS;
  }
}

// 分享工具
export class ShareManager {
  async sharePreview(title: string, content: string): Promise<void> {
    try {
      if (navigator.share) {
        // 使用原生分享API
        await navigator.share({
          title: title,
          text: this.getShareText(content),
          url: window.location.href
        });
      } else {
        // 降级到复制链接
        await this.copyToClipboard(window.location.href);
        throw new Error('已复制链接到剪贴板，您可以手动分享');
      }
    } catch (error) {
      console.error('分享失败:', error);
      throw error;
    }
  }
  
  async generateShareLink(biographyId: string): Promise<string> {
    // 生成分享链接
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${biographyId}`;
    
    // 这里可以调用后端API生成短链接
    return shareUrl;
  }
  
  private getShareText(content: string): string {
    // 提取前100个字符作为分享文本
    const text = content.replace(/\n/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }
  
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

// 打印优化工具
export class PrintManager {
  optimizeForPrint(): void {
    // 添加打印样式
    const printCSS = `
      @media print {
        body {
          font-size: 12pt;
          line-height: 1.6;
          color: black;
          background: white;
        }
        
        .no-print {
          display: none !important;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .chapter-title {
          page-break-after: avoid;
        }
        
        .paragraph {
          orphans: 3;
          widows: 3;
        }
        
        @page {
          margin: 2cm;
          size: A4;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = printCSS;
    document.head.appendChild(style);
  }
  
  async printBiography(): Promise<void> {
    this.optimizeForPrint();
    
    // 延迟一下确保样式生效
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.print();
  }
}

// 导出选项接口
interface PDFExportOptions {
  format?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  fontSize?: number;
  fontFamily?: string;
  margin?: number;
  lineHeight?: number;
}

interface WordExportOptions {
  fontSize?: number;
  fontFamily?: string;
  lineSpacing?: number;
  pageMargin?: number;
}

interface HTMLExportOptions {
  theme?: 'classic' | 'modern' | 'elegant';
  includeCSS?: boolean;
  responsive?: boolean;
}

// 导出工具实例
export const pdfExporter = new PDFExporter();
export const wordExporter = new WordExporter();
export const htmlExporter = new HTMLExporter();
export const shareManager = new ShareManager();
export const printManager = new PrintManager();