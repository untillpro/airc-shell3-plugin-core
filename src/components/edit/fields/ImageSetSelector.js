/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate as t, Modal, NoImage } from 'airc-shell-core';
import { Button, Empty } from 'antd';
import cn from 'classnames';
import { funcOrString } from '../../../classes/helpers';

import Element from './ImageSetSelectorElement';

class ImageSetSelector extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            set: {},
            value: null
        };

        this.handleEdit = this.handleEdit.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
        const { context, field, value } = this.props;
        const { contributions } = context;
        const { set, accessor } = field;

        if (_.isString(set)) {
            const images = contributions.getSet(set);

            const res = {};

            images.map().forEach((v, k) => {
                res[k] = v;
            });
            
            this.setState({ set: res, value })
        } else {
            throw new Error(` field "${accessor}" should has "set" property specified.`)
        }
    }

    getLabel() {
        const { field } = this.props;
        const { title } = field;

        if (title) {
            return funcOrString(title);
        }

        return null;
    }

    handleEdit() {
        this.setState({
            opened: true
        });
    }

    handleOk() {
        const { value } = this.state;
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function') {
            onChange({ [accessor]: value });
        }

        this.setState({ opened: false });
    }

    handleCancel() {
        this.setState({
            opened: false,
            value: this.props.value
        });
    }

    handleItemDBClick(value) {
        const { onChange, field } = this.props;
        const { accessor } = field;

        if (onChange && typeof onChange === 'function') {
            onChange({ [accessor]: value });
        }

        this.setState({ value, opened: false });
    }

    selectElement(key) {
        if (key !== undefined) {
            this.setState({ value: key });
        }
    }

    renderSet() {
        const { field } = this.props;
        const { set: setName, size, contain, cover } = field;
        const { set, value } = this.state;

        if (!_.isString(setName)) {
            return <Empty description={t("There is no set associated with this field", "form", { set: setName })} />
        }

        if (_.isPlainObject(set) && _.size(set) > 0) {
            return (
                <div className={cn("image-set-selector-grid", size || "")}>
                    {
                        _.map(set, (src, key) => <Element
                            src={src}
                            key={`element_${key}`}
                            current={key === value}
                            onClick={this.selectElement.bind(this, key)}
                            onDoubleClick={this.handleItemDBClick.bind(this, key)}
                            contain={contain}
                            cover={cover}
                        />)
                    }
                </div>
            );
        }

        return <Empty description={t("There is no image in the set", "form", { set: setName })} />
    }

    renderPreview() {
        const { value, set } = this.state;
        const { contain, cover } = this.props.field;

        let node = null;

        if (value && set[value]) {
            node = (<div className={cn("image", { contain, cover })} style={{ backgroundImage: `url(${set[value]})` }} />);
        } else {
            node = <NoImage />
        }

        return (
            <div className="preview" onClick={this.handleEdit}>
                {node}
            </div>
        );
    }

    render() {
        const { opened } = this.state;

        const label = this.getLabel();

        return (
            <>
                <div className="image-set-selector">
                    {this.renderPreview()}

                    <div className="info">
                        <div className="label">
                            {label}
                        </div>
                        <div className="button">
                            <Button onClick={this.handleEdit}>
                                {t("Select image", "form")}
                            </Button>
                        </div>
                    </div>
                </div>

                {opened ? (
                    <Modal
                        title={label || t("Select image", "form")}
                        visible
                        okText={t("Ok", "common")}
                        cancelText={t("Cancel", "common")}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        size="tiny"
                    >
                        {this.renderSet()}
                    </Modal>
                ) : null}
            </>
        );
    }
}

ImageSetSelector.propTypes = {
    formContext: PropTypes.object,
    locations: PropTypes.arrayOf(PropTypes.number),
    autoFocus: PropTypes.bool,
    entity: PropTypes.string,
    context: PropTypes.object,
    field: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    showError: PropTypes.bool,
    errors: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    data: PropTypes.object,
    classifiers: PropTypes.object,
    isNew: PropTypes.bool,
    isCopy: PropTypes.bool,
};

export default ImageSetSelector;