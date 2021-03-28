const dataBase: any = {};

// getRecordFromDatabase
export const getRecordFromDatabase = (identifier: string): { string: number } => {
  if (dataBase[identifier] !== undefined) {
    return dataBase[identifier];
  }
};

// updateDatabase
export const updateDatabase = (reason: string, identifier: string) => {
  if (dataBase[identifier] !== undefined) {
    const iden = dataBase[identifier];
    if (iden[reason] !== undefined) {
      iden[reason] = iden[reason] + 1;
    } else {
      iden[reason] = 1;
    }
  } else {
    dataBase[identifier] = {
      [reason]: 1,
    };
  }
};

/*
Schema!
{
  "merchant-identifierA": {
    "reasonA": count,
    "reasonB": count,
    ...
  },
  "merchant-identifierB": {
    "reasonA": count,
    "reasonZ": count,
    ...
  },
  ...
}
*/
