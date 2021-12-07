/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lc from 'langcode-info';
import moment from 'moment';
import i18next from 'i18next';
import { Logger } from 'airc-shell-core';

import { 
    initContextLang, 
    sendLanguageChanged,
    setLanguage
} from '../../actions';

import 'moment/locale/nl';
import 'moment/locale/nl-be';
import 'moment/locale/ru';

const DEFAULT_LOCALE = 'en';
const DEFAULT_LANG = 'enEN';
const DEFAULT_LANG_CODE = '0000';
const DEFAULT_NS = 'translation';

class LangProvider extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            init: false
        };
    }
    componentDidMount() {
        this.init();
    }

    componentDidUpdate(oldProps) {
        if (this.props.langCode !== oldProps.langCode) {
            this.props.setLanguage(this.props.langCode);
        }
    }

    init() {
        const { 
            currentLanguage, 
            defaultLanguage, 
            languages, 
            langCode, 
            defaultLangCode
        } = this.props;

        let hex = DEFAULT_LANG_CODE;
        let lng = null;
        let locale = null;

        if (currentLanguage && _.isString(currentLanguage)) {
            hex = langCode; 
        } else if (defaultLanguage && _.isString(defaultLanguage)) {
            hex = defaultLangCode;
        }

        let lang = lc.langByHex(hex);

        if (lang) {
            lng = lang.lex();
            locale = lang.locale();
        } else {
            lng = DEFAULT_LANG;
            locale = DEFAULT_LOCALE;
        }

        if (languages && _.size(languages) > 0) {
            i18next.init({
                debug: true,
                fallbackLng: _.keys(languages),
                defaultNS: DEFAULT_NS,
                lng: lng,
                resources: languages,
                interpolation: {
                    escapeValue: false,
                }
            }, (err, t) => {
                if(!err) {
                    this._initEntitiesI18n()
                    moment.locale(locale);
                    this.props.initContextLang(lng, hex);

                    this.setState({ init: true });
                } else {
                    Logger.error(err);
                    throw new Error(err);
                }
            });
        } else {
            moment.locale(DEFAULT_LOCALE);
        }
    }

    _initEntitiesI18n() {
        const { contributions } = this.props;
        
        if (!_.isObject(contributions)) return;

        const points = contributions.getPoints("language");

        if (_.isArray(points) && points.length > 0) {
            points.forEach(entity => {
                const point = contributions.getPoint("language", entity);
                const conts = point.getContributuions();

                _.forEach(conts, (cp, locale) => {
                    const translations = point.getContributuionValue(locale); 

                    i18next.addResourceBundle(locale, DEFAULT_NS, { [`contributions#${entity}`]: translations });
                });
            });
        }
    }

    render() {
        const { currentLanguage } = this.props;

        if (!this.state.init) {
            return null;
        }

        return (
            <div className="lang-provider-container" key={`lang_${currentLanguage}`}>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { contributions } = state.context;
    const { currentLanguage, defaultLanguage, langCode, defaultLangCode } = state.options;

    return {
        contributions,
        currentLanguage,
        defaultLanguage,
        langCode, 
        defaultLangCode
    };
}

LangProvider.propTypes = {
    children: PropTypes.node.isRequired,
    contributions: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    defaultLanguage: PropTypes.string.isRequired,
    languages: PropTypes.object.isRequired,
    initContextLang: PropTypes.func.isRequired,
    sendLanguageChanged: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { 
    initContextLang,
    sendLanguageChanged,
    setLanguage
})(LangProvider);

