/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
//import { Logger } from 'airc-shell-core';
import pretifyData from '../ResponseDataPretifier';
import ForeignKeys from '../../const/ForeignKeys';
import EmbeddeTypes from '../../const/EmbeddeTypes';
import blacklist from 'blacklist';

import { reduce } from './';

import {
    SYS_ID_PROP,
    STATE_FIELD_NAME
} from '../../const/Common';

import {
    TYPE_ENTITIES,
    TYPE_FORMS,
    TYPE_SECTIONS,
    TYPE_COLLECTION,
    C_COLLECTION_ELEMENTS,
    C_COLLECTION_FILTERS,
    C_COLLECTION_ENTITY,
    C_COLLECTION_REQUIRED_CLASSIFIERS
} from '../contributions/Types';

import {
    generateTempId,
    bufferToLangMap
} from './';


export const checkResponse = (response) => {
    if (_.isPlainObject(response)) {
        const { status, errorDescription, error } = response;

        if (status && status !== 200) {
            throw new Error(errorDescription || error);
        }

        return true;
    }

    throw new Error(response);
}

export const isValidEntity = (context, entity) => {
    const { contributions } = context;

    if (!contributions) return false;

    const point = contributions.getPoint(TYPE_ENTITIES, entity)
    if (point != null) {
        return true;
    }

    return false;
}

export const isEmbeddedType = (type) => {
    if (_.indexOf(EmbeddeTypes, String(type).toLocaleLowerCase()) >= 0) return true;

    return false;
};

export const getObject = async (context, ops) => {
    const { scheme, wsid, id, props } = ops;
    const { api } = context;

    if (scheme && api) {
        let properties = props;

        properties.elements = getEntityColletionElements(context, scheme);

        return api.object(wsid, id)
            .then((result) => {
                const classifiers = result?.xrefs ?? {};
                const data = blacklist(result, ["xrefs"]);
                const resolvedData = applyClassifiers({ data, classifiers }, scheme)

                return { resolvedData };
            })
            .catch((e) => {
                throw new Error(e);
            });
    } else {
        throw new Error(`getObject() method error: 'api' or 'scheme' not specified!`);
    }
}

export const getCollection = async (context, ops, applyMl = true) => {
    const { scheme, wsid, props } = ops;
    const { api } = context;

    if (scheme && api) {
        let location = _.isArray(wsid) ? wsid[0] : wsid;
        let elements = getEntityColletionElements(context, scheme);
        let properties = props;

        properties.elements = elements;

        return api.collection(scheme, location, properties)
            .then((Data) => {
                if (!_.isPlainObject(Data)) return { resolvedData: [] };

                const { result } = Data;

                let data = pretifyData(elements, result);

                // if (applyMl) {
                //     data = applyML(context, data, scheme);
                // }

                data = enrichWithEntries(data, location);

                return {
                    resolvedData: data,
                };
            })
            .catch((e) => {
                throw new Error(e);
            });
    } else {
        throw new Error(`${scheme} error: 'api' not specified!`);
    }
};

export const getEntityColletionElements = (context, entity) => {
    const { contributions } = context;

    if (!contributions) return null;

    return contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_ELEMENTS);
};

export const getEntityEmbeddedTypes = (entity, contributions) => {
    const sectionsContributon = contributions.getPointContributions(TYPE_FORMS, entity);

    if (sectionsContributon && sectionsContributon["embeddedTypes"]) {
        return sectionsContributon["embeddedTypes"];
    }

    return null;
}

export const getEntityFields = (entity, contributions, nonEmbedded = false) => {
    const sectionsContributon = contributions.getPointContributions(TYPE_FORMS, entity);
    let sections = null;

    if (sectionsContributon && sectionsContributon["sections"]) {
        sections = sectionsContributon["sections"];
    }

    let fields = [];

    if (sections) {
        _.each(sections, (section) => {
            const sectionFields = contributions.getPointContributions(TYPE_SECTIONS, section)["fields"];

            if (sectionFields && sectionFields.length > 0) {
                fields = [...fields, ...sectionFields];
            }
        });
    }

    if (nonEmbedded) {
        let newFields = [];

        _.each(fields, (field) => {
            if (field.embedded !== true) {
                newFields.push(field);
            }
        });

        fields = newFields;
    }

    return fields;
}

export const applyClassifiers = (Data, Entity) => {
    const { data, classifiers } = Data;

    let entity = String(Entity).toLowerCase();
    let result = { ...data };

    if (
        classifiers && _.size(classifiers) > 0 &&
        data && _.size(data) > 0
    ) {
        return processClassifier(data, classifiers, entity, 0, null);
    }

    return result;
}

export const processClassifier = (item, classifiers = {}, entity, maxLevel = 3, level = 0) => {
    if (!item) return {};

    if (!classifiers || _.size(classifiers) === 0) return item;
    if (maxLevel > 0 && level >= maxLevel) return item;

    _.forEach(item, (value, key) => {
        if (_.isArray(value)) {
            _.each(value, (val, i) => item[key][i] = processClassifier(val, classifiers, key, maxLevel, level + 1));
        } else if (_.isObject(value)) {
            processClassifier(value, classifiers, key, maxLevel, level + 1)
        } else {
            if (ForeignKeys[entity] && ForeignKeys[entity][key]) {
                let foreignEntity = ForeignKeys[entity][key];

                if (_.isNumber(value) && classifiers[foreignEntity] && classifiers[foreignEntity][value]) {
                    item[key] = { ...classifiers[foreignEntity][value] };

                    processClassifier(item[key], classifiers, foreignEntity, maxLevel, level + 1);
                } else if (_.isPlainObject(value)) {
                    item[key] = { ...value };
                } else {
                    item[key] = value;
                }
            }
        }
    });

    // if (item.id && !item._entry) {
    //     item._wsid = wsid;
    //     item._entry = { id: item.id, wsid };
    // }

    return item;
}

// mutating given data with i18n values for fields, that has ML value
export const applyML = (context, data, Entity) => {
    let entity = String(Entity).toLowerCase();
    const ml = {};

    if (data && _.isObject(data) && _.size(data) > 0) {
        _.forEach(data, (variants) => {
            _.forEach(variants, (item) => {
                applyMLToItem(context, entity, item, ml)
            });
        });
    }
};

export const enrichWithEntries = (data, wsid) => {
    if (data && _.size(data) > 0) {
        _.forEach(data, (item) => {
            if (_.isNumber(item[SYS_ID_PROP])) {
                item["_entry"] = { id: item[SYS_ID_PROP], wsid };
            }
        });
    }

    return data;
}

export const getEntityFilters = (context, entity) => {
    const { contributions } = context;

    if (!contributions) return null;

    return contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_FILTERS) || null;
};

export const getEntityRequiredClassifiers = (context, entity) => {
    const { contributions } = context;

    if (!contributions) return null;

    return contributions.getPointContributionValues(TYPE_COLLECTION, entity, C_COLLECTION_REQUIRED_CLASSIFIERS);
};

// DATA PROCESSING

export const processEntityData = async (context, entity, data, entries) => {

    if (!data || typeof data !== 'object') {
        throw new Error('Wrong data specified to .', data);
    }

    let promises = [];

    if (entries && entries.length > 0) {
        promises = entries.map((entry) => {
            const { id, wsid } = entry;

            return proccessEntry(context, id, entity, wsid, data);
        });
    } else {
        throw new Error('Cant create new entry: no selected locations found');
    }

    if (promises.length > 0) {
        return Promise.all(promises);
    } else {
        throw new Error('Nothing to proceed');
    }
}

export const proccessEntry = async (context, entityId, type, wsid, data) => {
    const { api, contributions } = context;

    const id = entityId || generateTempId();

    let operations = getOperation(context, data, id, type, null, null);

    operations.reverse();

    // embeded types

    const embeddedTypes = getEntityEmbeddedTypes(type, contributions);

    if (embeddedTypes && embeddedTypes.length > 0) {
        _.each(embeddedTypes, (eType) => {
            if (data[eType]) {
                let d = data[eType];
                let eId = d && d.id ? parseInt(d.id) : null;
                let ops = getOperation(context, d, eId, eType, id, type);

                if (ops && ops.length > 0) {
                    operations = [...operations, ...ops];
                }
            }
        });
    }

    return api.conf(operations, wsid).then((Data) => {
        return {
            ...Data,
            ID: entityId,
            WSID: wsid
        };
    });
}

export const getOperation = (context, data, entityId, entity, parentId, parentType) => {
    const { contributions } = context;
    let resultData = {};
    let operations = [];

    const isNew = !entityId || entityId < 65536;
    const id = entityId || generateTempId();
    let type = contributions.getPointContributionValue(TYPE_COLLECTION, entity, C_COLLECTION_ENTITY) || entity;

    if (STATE_FIELD_NAME in data) resultData[STATE_FIELD_NAME] = Number(data[STATE_FIELD_NAME]) || 0;

    const fields = getEntityFields(type, contributions, true);

    if (fields && fields.length > 0) {
        _.each(fields, (field) => {
            const { accessor, value_accessor, entity: fentity, type: ftype } = field;

            if (!accessor || data[accessor] === undefined) return;

            if (isEmbeddedType(ftype) && data[accessor]) {
                _.each(data[accessor], (d) => {
                    if (!d) return;

                    const ops = getOperation(context, d, d.id, fentity, id, entity);

                    if (ops && ops.length > 0) {
                        operations = [...operations, ...ops];
                    }
                });
            } else {
                if (value_accessor && data[accessor] && typeof data[accessor] === 'object') {
                    resultData[accessor] = data[accessor][value_accessor];
                } else {
                    resultData[accessor] = data[accessor];
                }
            }
        });
    }

    const hiddenValues = contributions.getPointContributionValue(TYPE_FORMS, entity, 'hidden');

    if (hiddenValues && typeof _.isObject(hiddenValues) && !_.isArray(hiddenValues)) {
        resultData = { ...resultData, ...hiddenValues };
    }

    if (_.size(resultData) > 0) {
        if (parentType && parentId) {
            let foreignKey = getParentForeignKey(entity, parentType)

            if (foreignKey) {
                resultData[foreignKey] = parentId;
            }

        }

        operations.push({
            _create: isNew,
            _id: id,
            _scheme: type,
            _parent_id: parentId,
            _data: resultData
        });
    }

    return operations;
}

export const getParentForeignKey = (entity, parentEntity) => {
    let res = null;

    if (ForeignKeys[entity]) {
        const fk = ForeignKeys[entity];
        res = _.findKey(fk, (k) => k === parentEntity);
    }

    return res;
}

export const prepareCopyData = (data) => {
    if (data && _.isPlainObject(data)) {
        return reduce(
            data,
            (r, v, k) => {
                if (k === SYS_ID_PROP) return;
                else r[k] = v;
            },
            (v, k) => typeof v === 'object' && String(k).indexOf('id_') !== 0
        );
    }

    return {};
}

// used for restaurant_computers like entites
export const checkForEmbededTypes = (context, entity, data) => {
    const { contributions } = context;

    if (!contributions || !entity) return data;

    const Data = { ...data };

    const pointContributions = contributions.getPointContributions(TYPE_FORMS, entity);
    const embedded_types = pointContributions ? pointContributions.embeddedTypes : null;

    if (embedded_types && embedded_types.length > 0) {
        _.each(embedded_types, (type) => {
            if (_.isArray(Data[type]) && Data[type].length > 0) {
                Data[type] = Data[type][0];
            }
        });
    }

    return Data;
}

//*************/

const applyMLToItem = (context, entity, item, ml) => {
    if (!ml[entity]) {
        ml[entity] = getEntityML(context, entity);
    }

    _.forEach(item, (value, key) => {
        if (_.isArray(value)) {
            _.each(value, (val) => applyMLToItem(context, keyToEntity(key), val, ml));
        } else if (_.isObject(value)) {
            applyMLToItem(context, keyToEntity(key), value, ml);
        } else {
            if (ml[entity][key]) {
                let mlField = ml[entity][key];

                if (_.isString(item[mlField])) {
                    item[key] = getMLValue(context, item[mlField], value)
                }
            }
        }
    });
}

const getEntityML = (context, entity) => {
    const { contributions } = context;
    const entityContribution = contributions.getPointContributions('forms', entity);
    const res = {};

    if (entityContribution && entityContribution.sections) {
        _.each(entityContribution.sections, (sectionName) => {
            const s = contributions.getPointContributions('sections', sectionName);

            if (s && _.isArray(s.fields) && s.fields.length > 0) {
                _.forEach(s.fields, (f, n) => {
                    const { accessor, ml_accessor } = f;

                    if (accessor && ml_accessor) {
                        res[accessor] = ml_accessor
                    }
                });
            }
        });
    }

    return res;
}

const getMLValue = (context, blob, dafaultValue) => {
    const { langCode } = context;

    let res = dafaultValue;

    if (blob && _.isString(blob)) {
        const ml = bufferToLangMap(blob);

        if (ml && ml[langCode]) {
            res = ml[langCode];
        }
    }

    return res;
}

const keyToEntity = (key) => {
    if (!_.isString(key)) return null;

    if (key.indexOf("id_") === 0) {
        return key.slice(3);
    }

    return key;
}