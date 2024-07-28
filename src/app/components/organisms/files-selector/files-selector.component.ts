import { SessionService } from './../../../shared/services/utils/session.service';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FileFlatNode } from '@shared/models/files-select.model';
import { IndexedDBChatApiService } from '../../../shared/services/utils/indexedb-chat-api.service';
import { EditModalComponent } from '@components/molecules/edit-modal/edit-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { SpinnerComponent } from '@components/atoms/spinner/spinner.component';
import { ChatFilesService } from '@shared/services/utils/chat-services/chat-files.service';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { UserKnowledgebaseActionEnum } from '@shared/services/utils/tagging-service/types';
import { OverlayBlockService } from '@shared/services/utils/overlay-block.service';
import { MatBadgeModule } from '@angular/material/badge';
import { IKnowledgeBase } from '@shared/models/chat-interaction.model';
import { GoogleDriveService } from '@shared/services/utils/google-service/google-drive.service';

@Component({
  selector: 'app-files-selector',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    MatTreeModule,
    MatButtonModule,
    NgClass,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe,
    SpinnerComponent,
    MatBadgeModule,
    DecimalPipe,
  ],
  templateUrl: './files-selector.component.html',
  styleUrl: './files-selector.component.scss',
})
export class FilesSelectorComponent implements OnDestroy {
  @ViewChild('emptyItem') emptyItem!: ElementRef;

  private destroy$ = new Subject<void>();

  processing: boolean = false;
  /* Drag and drop */
  dragNode!: FileFlatNode | null;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime!: number;
  dragNodeExpandOverArea!: string;

  filesChange: boolean = false;
  private formFiles: FormData = new FormData();

  private categorySelected: FileFlatNode = {
    file: { nameFile: 'OTHERS' },
    expandable: true,
    empty: false,
    level: 0,
  };

  hasChild = (_: number, node: FileFlatNode) => node.expandable;

  hasNoContent = (_: number, node: FileFlatNode) => node.empty;

  editModal: MatDialogRef<EditModalComponent> | undefined;

  isAttachPanel: boolean = false;

  private loadingService = inject(OverlayBlockService);
  private sessionService = inject(SessionService);
  private googleDriveService = inject(GoogleDriveService);

  constructor(
    public dialog: MatDialog,
    private indexedDBChatApiService: IndexedDBChatApiService,
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private apiClientService: ApiClientService,
    private chatFilesService: ChatFilesService,
    private taggingService: TaggingService
  ) {
    this.chatFilesService
      .openHistoryFiles(undefined, undefined, true)
      .finally(() => {
        this.isAttachPanel = true;
      });

    this.checklistSelection.changed.subscribe(event => {
      if (event.added.length > 0) {
        event.added.forEach(node => {
          if (node.expandable || !node.empty) {
            this.deselectDescendantsOfOtherParents(node);
          } else if (node.empty) {
            this.checklistSelection.deselect(node);
          }
        });
      }
      if (event.removed.length > 0) {
        event.removed.forEach(node => {
          if (!node.expandable) {
            const parent = this.getParentNode(node);
            if (parent && this.checklistSelection.isSelected(parent)) {
              this.checklistSelection.deselect(parent);
            }
          }
        });
      }
    });

    this.googleDriveService
      .onPickerDownloadFile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async file => {
        if (!file) return;
        const blob = new Blob([file.body], {
          type: file.mimeType,
        });

        const fileObject = new File([blob], file.name, {
          type: file.mimeType,
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileObject);
        const fileList: FileList = dataTransfer.files;
        await this.fileBrowseHandler({ target: { files: fileList } } as any);
      });
  }

  private deselectDescendantsOfOtherParents(node: FileFlatNode) {
    const parent = !node.expandable ? this.getParentNode(node) : node;
    parent &&
      this.getParents()
        .filter(item => item && item.file.nameFile !== parent.file.nameFile)
        .forEach(parent => {
          setTimeout(() => {
            this.treeControl.getDescendants(parent).forEach(child => {
              this.checklistSelection.deselect(child);
            });
          }, 10);
        });
  }

  private getParentNode(node: FileFlatNode): FileFlatNode | undefined {
    return this.treeControl.dataNodes?.find(
      item =>
        item.file.nameFile.toUpperCase() === node.file.category?.toUpperCase()
    );
  }

  /**
   * handle file from browsing
   */
  async fileBrowseHandler(event: Event) {
    this.taggingService.tag(TaggingEvents.click_upload_file, {
      user_knowledgebase: this.categorySelected?.file?.nameFile,
    });
    const target = event.target as HTMLInputElement;
    if (target?.files && !!target.files.length) {
      const startTime = Date.now();
      const filesUploaded = await this.prepareFilesList(target.files);
      this.taggingService.tag(TaggingEvents.upload_file, {
        filesSelected: target.files.length,
        filesUploaded: filesUploaded,
        success: filesUploaded === target.files.length,
        seconds: (Date.now() - startTime) / 1000,
      });
    }
    target.value = '';
  }

  async prepareFilesList(files: FileList) {
    if (!files.length) return 0; // Early return for empty list
    this.loadingService.message = 'UPLOAD_FILES_MESSAGE';
    this.loadingService.showLoading();
    const filesUploaded = await this.processFiles(files);
    this.loadingService.hideLoading();
    return filesUploaded;
  }

  private async processFiles(files: FileList) {
    const supportedFileType = 'application/pdf';
    const unsupportedFileTypeMessage = 'Solo se aceptan archivos PDF';
    // supportedSize in bytes 20MB
    const supportedFileSize = 20971520;
    const supportedFileSizeMessage =
      'El archivo excede el tamaño permitido (20MB)';
    const filesArray = Array.from(files);
    let filesUploaded = 0;
    for (const element of filesArray) {
      const file = element;
      if (file.type !== supportedFileType) {
        this._snackBar.open(unsupportedFileTypeMessage, 'Cerrar'); // Handle unsupported type
        continue;
      }

      if (file.size > supportedFileSize) {
        this._snackBar.open(supportedFileSizeMessage, 'Cerrar'); // Handle unsupported size
        continue;
      }
      let idFile = undefined;
      try {
        const fileInBD = await this.indexedDBChatApiService.getFileByName(
          file.name
        );
        if (!fileInBD?.length) {
          idFile = await this.indexedDBChatApiService.addOrUpdateFile(
            file.name,
            [],
            this.categorySelected.file.nameFile,
            '',
            undefined,
            undefined,
            undefined,
            'true'
          );
          await this.chatFilesService.openHistoryFiles();
          setTimeout(() => {
            this.expandParent(element.name);
          }, 10);
          this.formFiles.append('files', element);
          this.processing = true;

          const response = await firstValueFrom(
            this.apiClientService.uploadFile(this.formFiles)
          );
          const filteredKnowledgeBase = response.knowledgeBase.filter(
            item => item.embeddings.length > 0
          );

          await this.addOrUpdateFile(filteredKnowledgeBase);

          if (!filteredKnowledgeBase.length) {
            await this.indexedDBChatApiService.deleteFile(idFile);
            this._snackBar.open(
              'No se encontraron bloques de texto en el archivo',
              'Cerrar',
              {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 10000,
              }
            );
            continue; // Skip to next file
          }
        }
        this.selectedAndExpandParent(file.name);
        filesUploaded++;
      } catch (error) {
        console.error(error);
        this._snackBar.open(
          'Error al procesar el archivo, intente nuevamente',
          'Cerrar',
          {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000,
          }
        );
        idFile && (await this.indexedDBChatApiService.deleteFile(idFile));
      } finally {
        this.formFiles = new FormData();
        this.processing = false;
        this.chatFilesService.filesHistory = [];
        await this.chatFilesService.openHistoryFiles();
      }
    }
    return filesUploaded;
  }

  private async addOrUpdateFile(filteredKnowledgeBase: IKnowledgeBase[]) {
    for (const item of filteredKnowledgeBase) {
      await this.indexedDBChatApiService.addOrUpdateFile(
        item.fileName,
        item.embeddings,
        this.categorySelected.file.nameFile,
        item.content,
        item.numChars,
        item.numChunks,
        item.numTokens,
        'false'
      );
    }
  }

  expandParent(nameFile: string) {
    const ancestors = this.getAncestors(this.dataSource.data, nameFile);
    let parentSelected = null;
    if (ancestors && ancestors.length > 1) {
      const parentName = ancestors[ancestors.length - 2].nameFile;
      parentSelected = this.treeControl.dataNodes?.find(
        item => item.file.nameFile === parentName
      );
    } else {
      parentSelected = this.treeControl.dataNodes?.find(
        item => item.file.nameFile === this.categorySelected.file.nameFile
      );
    }
    if (parentSelected) {
      this.treeControl.expand(parentSelected);
    }
    return parentSelected;
  }

  getParents(): FileFlatNode[] {
    return this.treeControl.dataNodes.filter(item => item.expandable);
  }

  selectedAndExpandParent(nameFile: string) {
    this.filesChange = true;
    this.chatFilesService.selectedConcurrentNodes();
    const fileSelected = this.treeControl.dataNodes?.find(
      item => item.file.nameFile === nameFile
    );
    if (fileSelected)
      this.chatFilesService.checklistSelection.select(fileSelected);
    this.expandParent(nameFile);
  }

  getAncestors(array: any[], name: string) {
    if (typeof array != 'undefined') {
      for (const element of array) {
        if (element.nameFile === name) {
          return [element];
        }
        if (element.children) {
          const a: any = this.getAncestors(element.children, name);
          if (a !== null) {
            a.unshift(element);
            return a;
          }
        }
      }
    }
    return null;
  }

  openDialogCreateOrUpdateCategoyFile(fileFlatNode?: FileFlatNode) {
    const dataNodes = this.treeControl.dataNodes;
    const isEdit = !!fileFlatNode;
    if (!fileFlatNode) {
      fileFlatNode = {} as any;
      fileFlatNode!.expandable = true;
      fileFlatNode!.level = dataNodes?.length ?? 0 + 1;
      fileFlatNode!.empty = true;
      fileFlatNode!.file = {} as any;
      fileFlatNode!.file.nameFile = '';
      fileFlatNode!.file.children = [];
    }

    this.editModal = this.dialog.open(EditModalComponent, {
      restoreFocus: false,
      data: {
        title: this.translate.instant('EDIT_CATEGORY_TITLE'),
        cancel: this.translate.instant('BUTTON_CANCEL'),
        confirm: this.translate.instant('EDIT_CHAT_CONFIRM'),
        text: fileFlatNode!.file.nameFile.slice(),
      },
    });
    this.editModal.afterClosed().subscribe(async (response: any) => {
      if (response !== undefined && response.action === 'confirm') {
        await this.saveCategoyFile(fileFlatNode!, response.value);
        this.taggingService.tag(TaggingEvents.user_knowledgebase_action, {
          name: response.value,
          action: isEdit
            ? UserKnowledgebaseActionEnum.EDIT
            : UserKnowledgebaseActionEnum.CREATE,
        });
      }
    });
  }

  handleDragStart(event: any, node: FileFlatNode) {
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event: any, node: FileFlatNode) {
    event.preventDefault();
    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if (
          new Date().getTime() - this.dragNodeExpandOverTime >
          this.dragNodeExpandOverWaitTimeMs
        ) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    //const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event: any, node: FileFlatNode) {
    event.preventDefault();
    if (node !== this.dragNode) {
      const parents = this.treeControl.dataNodes.filter(
        item => item.expandable === true
      );

      let fromIndex = -1;

      const fromParent = parents.find(parent => {
        const indexFound = parent.file.children!.findIndex(
          item => item.nameFile === this.dragNode!.file.nameFile
        );
        if (indexFound !== -1) {
          fromIndex = indexFound;
        }
        return fromIndex !== -1;
      });
      const targetParent = parents.find(parent => {
        if (!node.file.children)
          return (
            parent.file.children!.findIndex(
              item => item.nameFile === node.file.nameFile
            ) !== -1
          );
        return parent.file.nameFile === node.file.nameFile;
      }); // Nuevo padre (por ejemplo, el segundo padre)

      const targetIndex = 1; // Índice donde deseas insertar el hijo

      // Mueve el nodo al nuevo padre en la posición deseada
      if (fromIndex !== -1 && targetParent && fromParent) {
        const nodeToMove = fromParent.file.children![fromIndex];
        fromParent.file.children!.splice(fromIndex, 1); // Elimina el nodo del primer padre
        targetParent.file.children!.splice(targetIndex, 0, nodeToMove); // Inserta el nodo en la posición deseada en el nuevo padre
        this.indexedDBChatApiService.updateCategoryFile(
          this.dragNode!.file.id!,
          targetParent.file.nameFile
        );
        const fileChange = this.chatFilesService.filesHistory?.find(
          (file: any) => file.nameFile === this.dragNode!.file.nameFile
        );
        if (fileChange) {
          fileChange.category = targetParent.file.nameFile;
        }
      }
      this.chatFilesService.clearChecklistSelection();

      this.dataSource.data = parents.map(item => item.file);
      const fromParentSelected = this.treeControl.dataNodes?.find(
        item => item.file === fromParent!.file
      );
      fromParentSelected && this.treeControl.expand(fromParentSelected);

      const targetParentSelected = this.treeControl.dataNodes?.find(
        item => item.file === targetParent!.file
      );
      targetParentSelected && this.treeControl.expand(targetParentSelected);
    }
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(_event: any) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: FileFlatNode): boolean {
    if (node.expandable) {
      try {
        const descendants = this.treeControl?.getDescendants(node);
        if (descendants && descendants.length > 0) {
          const descendantsSelected = descendants.every(child =>
            this.chatFilesService.checklistSelection.isSelected(child)
          );
          descendantsSelected &&
            this.chatFilesService.checklistSelection.select(node);
          return descendantsSelected;
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FileFlatNode): boolean {
    if (node.expandable) {
      try {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child =>
          this.chatFilesService.checklistSelection.isSelected(child)
        );
        return result && !this.descendantsAllSelected(node);
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: FileFlatNode): void {
    this.chatFilesService.checklistSelection.toggle(node);
    if (node.expandable) {
      const descendants = this.treeControl.getDescendants(node);
      this.chatFilesService.checklistSelection.isSelected(node)
        ? this.chatFilesService.checklistSelection.select(...descendants)
        : this.chatFilesService.checklistSelection.deselect(...descendants);
    }
  }

  /** Select the category so we can insert the new item. */
  addNewFileItem(node: FileFlatNode) {
    this.treeControl.expand(node);
    this.categorySelected = node;
  }

  async deleteFileHistory(event: any, node: FileFlatNode) {
    const parentSelectCategory = { category: node.file.category };
    try {
      await this.indexedDBChatApiService.deleteFile(node.file.id!);
    } catch (error) {
      console.error(error);
    }
    this.chatFilesService.filesHistory = [];
    await this.chatFilesService.openHistoryFiles();
    this.chatFilesService.expandParentByName(
      parentSelectCategory.category ?? ''
    );
  }

  async saveCategoyFile(fileFlatNode: FileFlatNode, nameCategoryNew: string) {
    nameCategoryNew = nameCategoryNew.trim();
    fileFlatNode.file.nameFile = fileFlatNode.file.nameFile.trim();
    try {
      if (fileFlatNode.file.nameFile === nameCategoryNew) {
        return;
      }

      const dataNodes = this.treeControl.dataNodes ?? [];
      const findCategoryNodeNew = dataNodes.find(item => {
        return item.file.nameFile === nameCategoryNew;
      });
      if (findCategoryNodeNew) {
        this._snackBar.open(
          this.translate.instant('EXISTING_NAME_KNOWLEDGE_LABEL'),
          this.translate.instant('SNACKBAR_CLOSE'),
          {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000,
          }
        );
        return;
      }

      const nameCategoryOLD = fileFlatNode?.file?.nameFile;

      const findCategoryOld: any[] =
        (await this.indexedDBChatApiService.getCategoryByName(
          nameCategoryOLD
        )) ?? [];

      const findCategoryNew: any[] =
        (await this.indexedDBChatApiService.getCategoryByName(
          nameCategoryNew
        )) ?? [];

      const findCategoryNodeOld = dataNodes.find(item => {
        return item.file.nameFile === nameCategoryOLD;
      });

      if (
        findCategoryOld.length == 0 &&
        findCategoryNew.length == 0 &&
        !findCategoryNodeOld
      ) {
        await this.indexedDBChatApiService.createCategorys(nameCategoryNew, 0);
        dataNodes.unshift(fileFlatNode);
        this.chatFilesService.clearChecklistSelection();
        this.chatFilesService.updateFilesHistoryInTree();
        fileFlatNode.file.nameFile = nameCategoryNew;
      } else {
        const categoryInDB =
          findCategoryOld.length > 0 ? findCategoryOld[0] : undefined;
        if (categoryInDB) {
          await this.indexedDBChatApiService.updateCategory(
            categoryInDB.id,
            nameCategoryNew
          );
          this.treeControl.getDescendants(fileFlatNode).forEach(async item => {
            await this.indexedDBChatApiService.updateCategoryFile(
              item.file.id!,
              nameCategoryNew
            );
          });

          this.chatFilesService.filesHistory = [];
          await this.chatFilesService.openHistoryFiles();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async deleteCategory(node: FileFlatNode) {
    try {
      await this.indexedDBChatApiService.deleteCategory(node.file.id!);
      const orphanfiles =
        (await this.indexedDBChatApiService.getListFilesByCategory(
          node.file.nameFile
        )) ?? [];

      if (orphanfiles.length > 0) {
        orphanfiles.forEach(async file => {
          await this.indexedDBChatApiService.deleteFile(file.id);
        });
      }
      this.chatFilesService.filesHistory = [];
      await this.chatFilesService.openHistoryFiles();
      this.taggingService.tag(TaggingEvents.user_knowledgebase_action, {
        name: node?.file?.nameFile,
        action: UserKnowledgebaseActionEnum.DELETE,
      });
    } catch (error) {
      console.log(error);
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get checklistSelection() {
    return this.chatFilesService.checklistSelection;
  }

  get getChildrenSelected() {
    return this.chatFilesService.getChildrenSelected();
  }

  get viewTokens() {
    return this.sessionService.isAdmin() || this.sessionService.isUserPro();
  }

  get treeControl() {
    return this.chatFilesService.treeControl;
  }

  set dataSource(data: any) {
    this.chatFilesService.dataSource = data;
  }

  get dataSource() {
    return this.chatFilesService.dataSource;
  }
}
