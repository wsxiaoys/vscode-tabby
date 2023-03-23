import { CancellationToken, InlineCompletionContext, InlineCompletionItem, InlineCompletionItemProvider, InlineCompletionList, Position, ProviderResult, Range, TextDocument, workspace } from 'vscode';
import axios, { AxiosResponse } from 'axios';

export class TabbyCompletionProvider implements InlineCompletionItemProvider {
    private latestTimestamp: number = 0;

    private uuid = Date.now();

    //@ts-ignore
    // because ASYNC and PROMISE
    public async provideInlineCompletionItems(document: TextDocument, position: Position, context: InlineCompletionContext, token: CancellationToken): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
        if (!workspace.getConfiguration('tabby').get("enabled")) {
            console.debug("Extension not enabled, skipping.");
            return Promise.resolve(([] as InlineCompletionItem[]));
        }

        const prompt = this.getPrompt(document, position);
        const emptyResponse = Promise.resolve(([] as InlineCompletionItem[]))

        if (this.isNil(prompt)) {
            console.debug("Prompt is empty, skipping");
            return emptyResponse;
        }

        const currentTimestamp = Date.now();
        this.latestTimestamp = currentTimestamp;

        const suggestionDelay = 150;
        await this.sleep(suggestionDelay);
        if (currentTimestamp < this.latestTimestamp) {
            return emptyResponse;
        }

        // Prompt is already nil-checked
        console.debug("Requesting", this.uuid, currentTimestamp, JSON.stringify(prompt));
        const response = await this.callTabby(prompt as String);

        const hasSuffixParen = this.hasSuffixParen(document, position);
        const replaceRange = hasSuffixParen ? new Range(position.line, position.character, position.line, position.character + 1) : new Range(position, position);
        const completions = this.toInlineCompletions(response.data, replaceRange);
        return Promise.resolve(completions);
    }

    private getPrompt(document: TextDocument, position: Position): String | undefined {
        const maxLines = 20;
        const firstLine = Math.max(position.line - maxLines, 0);

        return document.getText(
            new Range(firstLine, 0, position.line, position.character)
        );
    }

    private isNil(value: String | undefined | null): boolean {
        return value === undefined || value === null || value.length === 0;
    }

    private sleep(milliseconds: number) {
        return new Promise(r => setTimeout(r, milliseconds));
    };

    private callTabby(prompt: String): Promise<AxiosResponse<any, any>> {
        return axios.post("http://localhost:5000/v1/completions", {
            prompt,
        })
    }

    private toInlineCompletions(value: any, range: Range): InlineCompletionItem[] {
        return value.choices?.map((choice: any) => choice.text)
            .map((choiceText: string) => new InlineCompletionItem(choiceText, range)) || [];
    }

    private hasSuffixParen(document: TextDocument, position: Position) {
        const suffix = document.getText(new Range(position.line, position.character, position.line, position.character + 1));
        return ")]}".indexOf(suffix) > -1;
    }
}
