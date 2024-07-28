import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable, inject } from '@angular/core';
import { FileFlatNode, KnowledgeNode } from '@shared/models/files-select.model';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { IFile } from '@shared/models/chat-interaction.model';
import { IndexedDBChatApiService } from '../indexedb-chat-api.service';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';

@Injectable({
  providedIn: 'root',
})
export class ChatFilesService {
  private indexedDBChatApiService = inject(IndexedDBChatApiService);
  checklistSelection = new SelectionModel<FileFlatNode>(true /* multiple */);

  filesHistory?: any[] = [];
  listSelectionConcurrent: FileFlatNode[] = [];

  private _transformer = (node: KnowledgeNode, level: number) => {
    return {
      expandable: !!node.children,
      empty: node.children?.length === 0,
      file: node,
      level,
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node?.level,
    node => node?.expandable,
    node => node?.children
  );

  treeControl = new FlatTreeControl<FileFlatNode>(
    node => node?.level,
    node => node?.expandable
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  calculateSemanticSimilarity(
    questionEmbedding: number[],
    maxTokens: number = 70000
  ): string {
    const selectedFiles = this.getChildrenSelected();
    if (!selectedFiles?.length) return '';

    // en caso de no tener la ultima version que contiene el numTokes se da un valor de 100000
    const cantTokens = selectedFiles.reduce(
      (acc, item) => acc + (item.file?.numTokens ?? maxTokens),
      0
    );
    if (cantTokens > 0 && cantTokens <= maxTokens) {
      //retorna el contenido de los archivos cuando es menor o igual 100000 tokens
      return this.getAllTextFiles();
    }

    // Calculate semantic similarity for each file embedding
    const embeddingsWithSimilarity = selectedFiles.flatMap(({ file }) =>
      file.embedding?.map(embedding => ({
        ...embedding,
        fileName: file.nameFile,
        cosineSimilarity: this.cosineSimilarity(
          embedding.embedding,
          questionEmbedding
        ),
      }))
    );

    // Sort by descending similarity
    embeddingsWithSimilarity.sort(
      (a, b) => b.cosineSimilarity - a.cosineSimilarity
    );

    let tokenCount = 0;
    const topResults: any[] = [];

    // selecciona los texto que tienen mejor similaridad y que sumen menos de maxTokens
    embeddingsWithSimilarity.some(embedding => {
      const { numTokens } = embedding;
      if (tokenCount + numTokens <= maxTokens) {
        topResults.push(embedding);
        tokenCount += numTokens;
        return false; // Continuar iterando
      } else {
        return true; // Salir del bucle
      }
    });

    const context = topResults
      .map(file =>
        file.category
          ? `Knowledge Base: ${file.category} \nFilename: ${file.fileName} \nDocument: ${file.content}\n`
          : `Filename: ${file.fileName} \nDocument: ${file.content}\n`
      )
      .join('');

    return context;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    const dotProduct = a.reduce((acc, element, i) => acc + element * b[i], 0);
    const normA = Math.sqrt(
      a.reduce((acc, element) => acc + element * element, 0)
    );
    const normB = Math.sqrt(
      b.reduce((acc, element) => acc + element * element, 0)
    );

    if (normA === 0 || normB === 0) {
      return 0; // Handle zero division gracefully
    }

    return dotProduct / (normA * normB);
  }

  getAllTextFiles(): string {
    const selectedFiles = this.getChildrenSelected();
    if (!selectedFiles?.length) return '';

    // Calculate semantic similarity for each file embedding
    const embeddingsFiles = selectedFiles.flatMap(({ file }) => {
      if (file?.content && file?.content?.length > 0) {
        return [
          {
            content: file.content,
            fileName: file.nameFile,
            category: file.category,
          },
        ];
      }
      return file.embedding?.map(embedding => ({
        fileName: file.nameFile,
        content: embedding.content,
        category: file.category,
      }));
    });

    return embeddingsFiles
      .map(file => {
        if (file) {
          return file.category
            ? `Knowledge Base: ${file.category} \nFilename: ${file.fileName} \nDocument: ${file.content}\n`
            : `Filename: ${file.fileName} \nDocument: ${file.content}\n`;
        }
        return '';
      })
      .join('');
  }

  getChildrenSelected(): FileFlatNode[] {
    return this.checklistSelection.selected.filter(item => !item.file.children);
  }

  getSelectedFiles(): IFile[] {
    return this.getChildrenSelected().map(item => ({
      id: item.file.id!,
      name: item.file.nameFile,
      size: item.file.numChunks,
      createAt: item.file.createAt,
    }));
  }

  getSelectedFilesObservable(): Subject<any> {
    return this.checklistSelection.changed;
  }

  async openHistoryFiles(
    filesById: any[] = [],
    selectedAllFiles = false,
    update = false
  ) {
    let filesHistoryInBD: any[] | undefined = [];
    if (filesById.length > 0) {
      filesHistoryInBD = filesById;
    } else {
      filesHistoryInBD = await this.indexedDBChatApiService.getListFiles();
    }
    let changeHistory = false;
    filesHistoryInBD?.forEach(file => {
      if (!this.filesHistory?.find(f => f.nameFile === file.nameFile)) {
        this.filesHistory?.push(file);
        changeHistory = true;
      }
    });

    if (update || changeHistory || filesHistoryInBD?.length === 0)
      await this.updateFilesHistoryInTree(
        filesHistoryInBD,
        selectedAllFiles && filesById.length > 0
      );
  }

  async updateFilesHistoryInTree(
    filesHistoryInBD?: any,
    selectedAllFiles = false
  ) {
    const oldSelection = {
      selected: [...this.checklistSelection.selected],
    };
    this.listSelectionConcurrent = oldSelection.selected;
    const categorys = await this.indexedDBChatApiService.getCategorys();
    const categorysName = categorys.map(category => category.nameFile);

    const categoryUnique = new Set();
    if (filesHistoryInBD) {
      filesHistoryInBD.forEach((element: any) => {
        if (
          !categorysName.includes(element.category) &&
          element.category &&
          element.category !== 'OTHERS'
        ) {
          categoryUnique.add({ nameFile: element.category });
        }
      });
      categorys.push(...categoryUnique);
    }

    const map = {} as any;
    categorys.forEach(category => {
      if (!map[category.nameFile]) {
        map[category.nameFile] = category;
      }
      const filterCategory =
        this.filesHistory?.filter(
          item => item.category === category.nameFile
        ) ?? [];
      map[category.nameFile].children = [...filterCategory];
    });

    this.filesHistory
      ?.filter(fh => !fh.category || fh.category === 'OTHERS')
      ?.forEach((item: any) => {
        if (!map['OTHERS']) {
          map['OTHERS'] = {
            nameFile: 'OTHERS',
            children: [],
          };
        }
        map['OTHERS'].children.push(item);
      });
    try {
      this.dataSource.data = Object.values(map);
      this.expandParentByName('OTHERS');
      this.selectedConcurrentNodes();
      if (selectedAllFiles) {
        this.treeControl.dataNodes?.forEach(
          selected =>
            !selected.expandable && this.checklistSelection.select(selected)
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  selectedConcurrentNodes() {
    let selectedsOld: any[] = [];
    this.listSelectionConcurrent.forEach(selected => {
      const foundSelected = this.treeControl.dataNodes?.find(
        item => item.file.nameFile === selected.file.nameFile
      );
      if (foundSelected) selectedsOld = [...selectedsOld, foundSelected];
    });

    this.clearChecklistSelection();
    selectedsOld.forEach(selected => {
      this.checklistSelection.select(selected);
    });
  }

  expandParentByName(category: string) {
    const parentSelect = this.treeControl.dataNodes?.find(
      item => item.file.nameFile === category
    );
    if (parentSelect) this.treeControl.expand(parentSelect!);
  }

  clearChecklistSelection(): void {
    this.checklistSelection.clear();
  }
}
