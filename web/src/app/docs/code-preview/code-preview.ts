import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { createHighlighter } from 'shiki';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'code-preview',
  templateUrl: './code-preview.html',
  imports: [ClipboardModule, SafeHtmlPipe, CommonModule],
  encapsulation: ViewEncapsulation.None,
})
export class CodePreviewComponent implements OnInit {
  @Input() codeContent: string = '';
  @Input() codeLang: string = 'bash';
  tooltipText: string = 'Copy';
  highlightedCode: string = ''; // Holds the highlighted HTML code
  copied: boolean = false; // Track copy state for icon switching

  async ngOnInit() {
    const highlighter = await createHighlighter({
      themes: ['slack-dark'],
      langs: [this.codeLang],
    });

    // Use codeContent instead of hardcoded string
    this.highlightedCode = highlighter.codeToHtml(this.codeContent, {
      lang: this.codeLang,
      theme: 'slack-dark',
    });
  }

  // Method to copy code content to clipboard
  copyToClipboard() {
    this.tooltipText = 'Copied!';
    this.copied = true;
    // Revert the tooltip text and icon after 1 second
    setTimeout(() => {
      this.tooltipText = 'Copy';
      this.copied = false;
    }, 1000);
  }
}
