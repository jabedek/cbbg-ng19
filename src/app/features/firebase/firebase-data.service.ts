import { inject, Inject, Injectable, OnDestroy } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FieldPath,
  getDocs,
  onSnapshot,
  query,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  WhereFilterOp,
  writeBatch,
} from 'firebase/firestore';
import { FirebaseCoreService } from './firebase-core';
import { undefinedToNull } from '@shared/utils/common.util';
import { consoleError, tryCatch } from '@shared/utils/dev.util';

export type DbResultDTO = {
  [key: string]: any;
} & { _id: string };

export type ListenerCallback<T> = (data: T | undefined, unsubFn: Unsubscribe | undefined) => void;

type NotArray = Record<string, unknown> | string | number | boolean;

export type DbReadDetails = {
  key: string;
  values: (string | number | boolean)[];
};

export type DbFiltersDetails = {
  key: string | FieldPath;
  condition: WhereFilterOp;
  value: any;
};

@Injectable({
  providedIn: 'root',
})
export class FirebaseDataService implements OnDestroy {
  private readonly _firebaseCore = inject(FirebaseCoreService);
  private get _firebaseDB() {
    return this._firebaseCore.__firebaseDB;
  }

  protected _unsubs = new Map<string, Unsubscribe>();
  get unsubs() {
    return this._unsubs;
  }

  constructor() {}

  ngOnDestroy(): void {
    this.deleteFirebaseListeners();
  }

  // Create
  public async insertData<T extends NotArray>(resourceName: string, docId: string, data: Partial<T>) {
    return this._insertData_base(resourceName, docId, data); //.catch((e) => consoleError(e, 'Error while creating new' + dbRes));
  }

  private async _insertData_base(resourceName: string, docId: string, data: any) {
    const col = collection(this._firebaseDB, resourceName);
    const clearedData = undefinedToNull(data);
    return setDoc(doc(col, docId), clearedData);
  }

  // Read (one, many, filter)
  public async readOneBy<T extends NotArray>(
    resourceName: string,
    readDetails: {
      key: string;
      value: string | number | boolean;
    },
  ): Promise<T | undefined> {
    return this._readOneBy_base<T>(resourceName, readDetails); //.catch((e) => consoleError(e, 'Error while reading' + dbRes));
  }

  private async _readOneBy_base<T>(
    resourceName: string,
    readDetails: { key: string; value: string | number | boolean },
  ) {
    const { key, value } = readDetails;
    const col = collection(this._firebaseDB, resourceName);
    const queryRef = query(col, where(key, '==', value));
    const [querySnapshot, querySnapshotError] = await tryCatch(getDocs(queryRef));

    if (querySnapshotError) {
      consoleError(querySnapshotError);
    }

    if (!querySnapshot) {
      return undefined;
    }

    const docs: DbResultDTO[] = [];
    querySnapshot.forEach((doc: any) => docs.push(doc.data() as DbResultDTO));

    return docs[0] as T;
  }

  public async readManyBy<T extends NotArray>(resourceName: string, readDetails: DbReadDetails) {
    return this._readManyBy_base<T>(resourceName, readDetails); //.catch((e) => consoleError(e, 'Error while reading' + dbRes));
  }

  private async _readManyBy_base<T>(resourceName: string, readDetails: DbReadDetails) {
    const col = collection(this._firebaseDB, resourceName);
    const { key, values } = readDetails;
    const queryRef = query(col, where(key, 'in', [...values, '']));

    const [querySnapshot, querySnapshotError] = await tryCatch(getDocs(queryRef));

    if (querySnapshotError) {
      consoleError(querySnapshotError);
    }
    if (!querySnapshot) {
      return [];
    }
    const docs: DbResultDTO[] = [];
    querySnapshot.forEach((doc: any) => docs.push(doc.data() as DbResultDTO));

    return docs as T[];
  }

  public async filterManyBy<T extends NotArray>(resourceName: string, readDetails: DbFiltersDetails[]) {
    return this._filterManyBy_base<T>(resourceName, readDetails);
  }

  private async _filterManyBy_base<T>(resourceName: string, readDetails: DbFiltersDetails[]) {
    const col = collection(this._firebaseDB, resourceName);
    const operations = readDetails.map((fd) => where(fd.key, fd.condition, fd.value));
    const queryRef = query(col, ...operations);

    const [querySnapshot, querySnapshotError] = await tryCatch(getDocs(queryRef));

    if (querySnapshotError) {
      consoleError(querySnapshotError);
    }
    if (!querySnapshot) {
      return [];
    }

    const docs: DbResultDTO[] = [];

    querySnapshot.forEach((doc: any) => docs.push(doc.data() as DbResultDTO));
    return docs as T[];
  }

  // Update
  public async updateData<T extends NotArray>(resourceName: string, docId: string, data: Partial<T>) {
    return this._updateData_base(resourceName, docId, data); //.catch((e) => consoleError(e, 'Error while updating' + dbRes));
  }

  private async _updateData_base(resourceName: string, docId: string, data: any) {
    const col = collection(this._firebaseDB, resourceName);
    const clearedData = undefinedToNull(data);
    return updateDoc(doc(col, docId), clearedData);
  }

  // Delete
  public async deleteData(resourceName: string, docId: string) {
    return this._deleteData_base(resourceName, docId); //.catch((e) => consoleError(e, 'Error while updating' + dbRes));
  }

  private async _deleteData_base(resourceName: string, docId: string) {
    const col = collection(this._firebaseDB, resourceName);
    return deleteDoc(doc(col, docId));
  }

  public async listenToChangesSnapshots<T>(
    readDetails: DbReadDetails,
    resourceName: string,
    callback: ListenerCallback<T[]>,
  ) {
    const { key, values } = readDetails;
    const col = collection(this._firebaseDB, resourceName);
    const queryRef = query(col, where(key, 'in', [...values, '']));

    const unsub: Unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const docs: DbResultDTO[] = [];
      querySnapshot.forEach((doc) => {
        const item = doc.data() as DbResultDTO;
        docs.push(item);
      });
      callback(docs as T[], unsub);
    });
  }

  // Listeners
  public addFirebaseListener(name: string, unsub: Unsubscribe) {
    this._unsubs.set(name, unsub);
  }

  public deleteFirebaseListener(name: string) {
    this._unsubs.forEach((unsub, key) => {
      if (key === name && unsub) {
        unsub();
        this._unsubs.delete(key);
      }
    });
  }

  public deleteFirebaseListeners() {
    this._unsubs.forEach((unsub, key) => {
      if (unsub) {
        unsub();
      }
      this._unsubs.delete(key);
    });
  }

  /**
   * Special collection ref getter for advanced operations
   */
  public specialColRef(resourceName: string) {
    const col = collection(this._firebaseDB, resourceName);
    return col;
  }
}
