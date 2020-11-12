import $ from 'jquery';
import fixtures from '../../helpers/positionFixtures.js';
import fx from 'animation/fx';
import pointerMock from '../../helpers/pointerMock.js';
import positionUtils from 'animation/position';
import Popover from 'ui/popover';
import { getBoundingRect } from 'core/utils/position';

import 'common.css!';
import 'generic_light.css!';

$('<style>.dx-popup-content { padding: 10px; }</style>').appendTo($('head'));

const POPOVER_CLASS = 'dx-popover';
const POPOVER_WRAPPER_CLASS = 'dx-popover-wrapper';
const POPOVER_ARROW_CLASS = 'dx-popover-arrow';
const POPOVER_WITHOUT_TITLE_CLASS = 'dx-popover-without-title';

const positionAtWindowCenter = function(element) {
    positionUtils.setup(element, {
        my: 'center',
        at: 'center',
        of: window
    });
};

const toSelector = function(cssClass) {
    return '.' + cssClass;
};

const wrapper = function() {
    return $('body').find(toSelector(POPOVER_WRAPPER_CLASS));
};

const getElementsPositionAndSize = function($popover, $target) {
    const $content = wrapper().find('.dx-overlay-content');
    const $popupContent = wrapper().find('.dx-popup-content');
    const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

    return {
        arrow: {
            height: $arrow.height(),
            width: $arrow.width(),
            offsetTop: $arrow.offset().top,
            offsetLeft: $arrow.offset().left,
            positionTop: $arrow.position().top,
            positionLeft: $arrow.position().left
        },
        target: {
            offsetTop: $target.offset().top,
            offsetLeft: $target.offset().left,
            width: $target.width(),
            height: $target.height(),
            positionTop: $target.position().top,
            positionLeft: $target.position().left,
        },
        content: {
            height: $content.outerHeight(true),
            width: $content.width(),
            offsetTop: $content.offset().top,
            offsetLeft: $content.offset().left,
            borderWidth: parseInt($content.css('borderBottomWidth'))
        },
        popupContent: {
            height: $popupContent.outerHeight(true),
            width: $popupContent.width(),
            outerWidth: $popupContent.outerWidth(),
            offsetTop: $popupContent.offset().top,
            offsetLeft: $popupContent.offset().left
        }
    };
};

QUnit.module('render', () => {
    QUnit.test('render', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            new Popover($popover, { visible: true });
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.ok($popover.hasClass(POPOVER_CLASS), 'has popover class');
            assert.equal($arrow.length, 1, 'has arrow');
        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('position', function(assert) {
        fixtures.simple.create();
        positionAtWindowCenter('#where');

        new Popover($('#what'), { target: '#where', visible: true, position: { my: 'top center', at: 'bottom center' } });
        assert.ok(wrapper().hasClass('dx-position-bottom'), 'popover has bottom position');

        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: { my: 'bottom center', at: 'top center' } });
        assert.ok(wrapper().hasClass('dx-position-top'), 'popover has top position');
        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: { my: 'left center', at: 'right center' } });
        assert.ok(wrapper().hasClass('dx-position-right'), 'popover has right position');
        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: { my: 'right center', at: 'left center' } });
        assert.ok(wrapper().hasClass('dx-position-left'), 'popover has left position');
        fixtures.simple.drop();
    });

    QUnit.test('position shortcuts', function(assert) {
        fixtures.simple.create();
        positionAtWindowCenter('#where');

        new Popover($('#what'), { target: '#where', visible: true, position: 'bottom' });
        assert.ok(wrapper().hasClass('dx-position-bottom'), 'popover has bottom position');
        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: 'top' });
        assert.ok(wrapper().hasClass('dx-position-top'), 'popover has top position');
        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: 'right' });
        assert.ok(wrapper().hasClass('dx-position-right'), 'popover has right position');
        fixtures.simple.drop();

        fixtures.simple.create();
        new Popover($('#what'), { target: '#where', visible: true, position: 'left' });
        assert.ok(wrapper().hasClass('dx-position-left'), 'popover has left position');
        fixtures.simple.drop();
    });

    QUnit.test('popup should not render arrow when the position side is center (T701940)', function(assert) {
        fixtures.simple.create();

        const popover = new Popover($('#what'), {
            position: { my: 'top left', at: 'center', of: window },
            visible: true
        });
        const arrow = popover.$element().find(`.${POPOVER_ARROW_CLASS}`);

        assert.strictEqual(arrow.height(), 0);
        assert.strictEqual(arrow.width(), 0);
        fixtures.simple.drop();
    });

    QUnit.test('popup should render correctly when it\'s position.of is event', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                visible: true,
                position: { my: 'bottom left', at: 'top left' }
            });

            $target.on('dxclick', function(e) {
                popover.option('position', { my: 'top', at: 'bottom', of: e });
            });

            $target.trigger('dxclick');

            assert.ok(true, 'there is no exception on this test');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('wrapper should has one CSS class for position alias', function(assert) {
        fixtures.simple.create();

        try {

            const $popover = $('#what');
            const $target = $('#where');

            positionAtWindowCenter($target);

            const popover = new Popover($popover, {
                visible: true,
                target: $target,
                position: { my: 'top center', at: 'bottom center' }
            });

            assert.ok(wrapper().hasClass('dx-position-bottom'));
            assert.ok(!wrapper().hasClass('dx-position-top'));

            popover.option('position', { my: 'bottom center', at: 'top center' });

            assert.ok(!wrapper().hasClass('dx-position-bottom'));
            assert.ok(wrapper().hasClass('dx-position-top'));
        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('arrow for popover without title', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $popover = $('#what');

            new Popover($popover, {
                visible: true,
                target: '#where',
                showTitle: false
            });

            assert.ok(wrapper().hasClass(POPOVER_WITHOUT_TITLE_CLASS), 'has css class considering title absence');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('arrow for popover should be rendered only once', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            const popover = new Popover($popover, {
                visible: true
            });

            popover._refresh();

            assert.equal(wrapper().find('.' + POPOVER_ARROW_CLASS).length, 1, 'popover has only one arrow');
        } finally {
            fixtures.simple.drop();
        }
    });
});

QUnit.module('options change', () => {
    QUnit.test('fullScreen', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');

            const popover = new Popover($('#what'), {
                target: $target,
                animation: null,
                visible: true
            });

            popover.option('fullScreen', true);
            assert.equal(popover.option('fullScreen'), false, 'popover does not support fullscreen option');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('target', function(assert) {
        fixtures.differentTargets.create();

        try {
            const $target = $('#where');
            const $newTarget = $('#there');
            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: 'top'
            });


            let elements = getElementsPositionAndSize($popover, $target);
            let target = elements.target;
            let arrow = elements.arrow;

            assert.equal(parseInt(arrow.offsetTop + arrow.height, 10), parseInt(target.offsetTop, 10), 'arrow top is OK');
            assert.equal(parseInt(arrow.offsetLeft + arrow.width / 2, 10), parseInt(target.offsetLeft + target.width / 2, 10), 'arrow left is OK');

            popover.option('target', $newTarget);

            elements = getElementsPositionAndSize($('#what'), $newTarget),
            target = elements.target,
            arrow = elements.arrow;

            assert.equal(parseInt(arrow.offsetTop + arrow.height, 10), parseInt(target.offsetTop, 10), 'arrow top is OK');
            assert.equal(parseInt(arrow.offsetLeft + arrow.width / 2, 10), parseInt(target.offsetLeft + target.width / 2, 10), 'arrow left is OK');

            assert.equal(popover.option('position'), 'top', 'position option saves alias');

        } finally {
            fixtures.differentTargets.drop();
        }
    });

    QUnit.test('arrow rendering after changing position', function(assert) {
        fixtures.simple.create();

        const popover = new Popover($('#what'), { visible: true, position: { at: 'right center', my: 'left center' } });
        const position = $.extend({}, popover.option('position'), {
            at: 'bottom center',
            my: 'top center'
        });

        popover.option('position', position);
        popover.hide();
        popover.show();

        assert.ok(wrapper().hasClass('dx-position-bottom'), 'absence of right position class');
        assert.ok(!wrapper().hasClass('dx-position-right'), 'presence of bottom position class');

        fixtures.simple.drop();
    });

    QUnit.test('arrowPosition option changed', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $target,
                width: 70,
                height: 70,
                visible: true,
                position: { at: 'right top', my: 'left top' },
                arrowPosition: 'auto'
            });

            popover.option('arrowPosition', 'end');

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');
            const arrowOffsetTop = $content.offset().top + $content.outerHeight() - $arrow.outerHeight();
            const arrowOffsetLeft = $target.offset().left + $target.width();

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow top offset is correct');
            assert.equal($arrow.offset().left, arrowOffsetLeft, 'arrow left offset is correct');

        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });
});

QUnit.module('arrow positioning', () => {
    QUnit.test('arrow position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');

            new Popover($('#what'), {
                target: $target,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const arrowOffsetTop = $target.offset().top + $target.height();
            const arrowOffsetLeft = Math.round($target.offset().left + $target.width() / 2 - $arrow.width() / 2);

            assert.equal($arrow.offset().top, arrowOffsetTop, 'popover arrow positioned at the bottom of the target vertically');
            assert.equal($arrow.offset().left, arrowOffsetLeft, 'popover arrow positioned at the center of the target horizontally');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.skip('arrow position is calculated relative to the target when popup-content is hidden', function(assert) {
        fixtures.simple.create();
        try {
            const $target = $('#where').css({
                width: 25,
                height: 25
            });

            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $target,
                animation: null,
                visible: false
            });

            $popover.hide();
            $popover.find('.dx-overlay-content').hide();
            popover.option('visible', true);
            $popover.show();

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const arrowOffsetTop = $target.offset().top + $target.height();
            const arrowOffsetLeft = $target.offset().left + $target.width() / 2 - $arrow.width() / 2;

            assert.equal($arrow.offset().top, arrowOffsetTop, 'popover arrow positioned at the bottom of the target vertically');
            assert.ok(Math.abs($arrow.offset().left - arrowOffsetLeft) <= 0.5, 'popover arrow positioned at the center of the target horizontally');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('arrow bottom left position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                visible: true,
                width: 70,
                height: 70,
                position: { at: 'bottom left', my: 'top left' }
            });
            const $content = popover.$content();

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const arrowOffsetTop = $target.offset().top + $target.height();
            const arrowOffsetLeft = Math.round($content.offset().left + ($content.outerWidth() - $arrow.width()) / 2);

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow top offset');
            assert.equal($arrow.offset().left, arrowOffsetLeft, 'arrow left offset');

        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('arrow right top position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                width: 70,
                height: 70,
                visible: true,
                position: { at: 'right top', my: 'left top' }
            });
            const $content = popover.$content();

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const arrowOffsetTop = Math.round($content.offset().top + ($content.outerHeight() - $arrow.height()) / 2);
            const arrowOffsetLeft = $target.offset().left + $target.width();

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow top offset');
            assert.equal($arrow.offset().left, arrowOffsetLeft, 'arrow left offset');

        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('\'arrowPosition\' option affects real arrow position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');

            new Popover($('#what'), {
                target: $target,
                width: 70,
                height: 70,
                visible: true,
                position: { at: 'right top', my: 'left top' },
                arrowPosition: 'start',
                arrowOffset: 10
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-overlay-content');
            const arrowOffsetTop = $content.offset().top + 10;

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow top offset is correct');

        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('arrow should be always attached to popover', function(assert) {
        fixtures.simple.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                width: 50,
                height: 50,
                visible: true
            });
            const $arrow = $(toSelector(POPOVER_ARROW_CLASS));
            const $content = $('.dx-popup-content');

            const positions = [
                { at: 'right top', my: 'left bottom' },
                { at: 'right bottom', my: 'left top' },
                { at: 'left top', my: 'right bottom' },
                { at: 'left bottom', my: 'right top' }
            ];

            $.each(positions, function(_, position) {
                const contentLeft = $content.offset().left;
                const contentRight = contentLeft + $content.outerWidth();
                const arrowLeft = $arrow.offset().left;
                const arrowRight = arrowLeft + $arrow.outerWidth();

                popover.option('position', position);
                assert.ok(arrowLeft >= contentLeft && arrowRight <= contentRight, 'arrow is between left and right popover\'s side');
            });
        } finally {
            fixtures.simple.drop();
        }
    });

    const testPopoverDisplaySide = function(positionConfig, targetSide) {
        QUnit.test('popover with position config ' + JSON.stringify(positionConfig) + ' should be shown on ' + targetSide, function(assert) {
            fixtures.frameAdapted.create();
            try {
                const $target = $('#where');

                new Popover($('#what'), {
                    target: $target,
                    width: 10,
                    height: 10,
                    visible: true,
                    position: positionConfig
                });

                assert.ok(wrapper().hasClass('dx-position-' + targetSide), 'class attached');
            } finally {
                fixtures.frameAdapted.drop();
            }
        });
    };

    testPopoverDisplaySide({ my: 'left top', at: 'left bottom' }, 'bottom');
    testPopoverDisplaySide({ my: 'right top', at: 'right bottom' }, 'bottom');
    testPopoverDisplaySide({ my: 'right top', at: 'center bottom' }, 'bottom');
    testPopoverDisplaySide({ my: 'top center', at: 'top center' }, 'bottom');
    testPopoverDisplaySide({ my: 'left bottom', at: 'left top' }, 'top');
    testPopoverDisplaySide({ my: 'right bottom', at: 'right top' }, 'top');
    testPopoverDisplaySide({ my: 'center bottom', at: 'right top' }, 'top');
    testPopoverDisplaySide({ my: 'bottom center', at: 'bottom center' }, 'top');
    testPopoverDisplaySide({ my: 'right top', at: 'left top' }, 'left');
    testPopoverDisplaySide({ my: 'right bottom', at: 'left bottom' }, 'left');
    testPopoverDisplaySide({ my: 'right center', at: 'left bottom' }, 'left');
    testPopoverDisplaySide({ my: 'left top', at: 'right top' }, 'right');
    testPopoverDisplaySide({ my: 'left bottom', at: 'right bottom' }, 'right');
    testPopoverDisplaySide({ my: 'left center', at: 'right bottom' }, 'right');
    testPopoverDisplaySide({ my: 'left center', at: 'left center' }, 'right');
    testPopoverDisplaySide({ my: 'right center', at: 'right center' }, 'left');

    QUnit.test('popover with position config should position arrow correctly', function(assert) {
        fixtures.frameAdapted.create();
        try {
            const $target = $('#where');
            new Popover($('#what'), {
                target: $target,
                width: 10,
                height: 10,
                visible: true,
                position: {
                    my: 'left top',
                    at: 'left bottom'
                }
            });

            assert.ok(wrapper().find('.' + POPOVER_ARROW_CLASS).offset().top >= $target.offset().top + $target.outerHeight(), 'arrow positioned correctly');
        } finally {
            fixtures.frameAdapted.drop();
        }
    });

    QUnit.test('arrow position inside of target', function(assert) {
        fixtures.frameAdapted.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                width: 50,
                height: 50,
                animation: null,
                visible: true,
                position: { at: 'top', my: 'top', boundaryOffset: '0 0' }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($arrow.offset().top, $target.offset().top, 'arrow top position is correct');

            popover.option('position', { at: 'bottom', my: 'bottom', boundaryOffset: '0 0' });
            assert.equal($arrow.offset().top + $arrow.outerHeight(), $target.offset().top + $target.outerHeight(), 'arrow bottom position is correct');

            popover.option('position', { at: 'left', my: 'left', boundaryOffset: '0 0' });
            assert.equal($arrow.offset().left, $target.offset().left, 'arrow left position is correct');

            popover.option('position', { at: 'right', my: 'right', boundaryOffset: '0 0' });
            assert.equal($arrow.offset().left + $arrow.outerWidth(), $target.offset().left + $target.outerWidth(), 'arrow right position is correct');
        } finally {
            fixtures.frameAdapted.drop();
        }
    });

    QUnit.test('arrow position should be correct if content is flipped', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                height: 90,
                width: 90,
                position: {
                    my: 'bottom',
                    at: 'top',
                    of: $target,
                    collision: 'flip flip'
                }
            });

            popover.show();

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            assert.equal($arrow.offset().top, $target.offset().top + $target.outerHeight(), 'arrow rendered correctly');
            assert.equal($content.offset().top, $target.offset().top + $target.outerHeight() + $arrow.outerHeight(), 'content rendered correctly');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });
});

QUnit.module('content positioning', () => {
    QUnit.test('content position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                animation: null,
                width: 50,
                height: 50,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            const contentOffsetTop = $arrow.offset().top + $arrow.height();
            const contentOffsetLeft = Math.round($target.offset().left + $target.width() / 2 - $content.outerWidth() / 2);

            assert.equal($content.offset().top, contentOffsetTop, 'popover content positioned at the bottom of the arrow vertically');
            assert.equal($content.offset().left, contentOffsetLeft, 'popover content positioned at the center of the arrow horizontally');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('Popover should be positioned correctly on the target right side when target is inside of svg (T891214)', function(assert) {
        fixtures.svg.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                position: {
                    my: 'left',
                    at: 'right'
                },
                // height: 40,
                target: $target,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');
            const targetRect = getBoundingRect($target.get(0));

            const contentOffsetTop = Math.round($target.offset().top + targetRect.height / 2 - $content.outerHeight() / 2);
            const contentOffsetLeft = Math.round($target.offset().left + targetRect.width + $arrow.width());
            const arrowOffsetTop = Math.round($target.offset().top + targetRect.height / 2 - $arrow.height() / 2);
            const arrowOffsetLeft = Math.round($target.offset().left + targetRect.width);

            assert.strictEqual($content.offset().top, contentOffsetTop, 'popover content top offset is correct');
            assert.strictEqual($content.offset().left, contentOffsetLeft, 'popover content left offset is correct');
            assert.strictEqual($arrow.offset().top, arrowOffsetTop, 'arrow offset top is correct');
            assert.strictEqual($arrow.offset().left, arrowOffsetLeft, 'arrow offset left is correct');
        } finally {
            fixtures.svg.drop();
        }
    });

    QUnit.test('Popover should be positioned correctly on the target bottom when target is inside of svg (T891214)', function(assert) {
        fixtures.svg.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                position: {
                    my: 'top',
                    at: 'bottom'
                },
                target: $target,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');
            const targetRect = getBoundingRect($target.get(0));

            const contentOffsetTop = Math.round($target.offset().top + targetRect.height + $arrow.outerHeight());
            const contentOffsetLeft = Math.round($target.offset().left + targetRect.width / 2 - $content.outerWidth() / 2);
            const arrowOffsetTop = Math.round($target.offset().top + targetRect.height);
            const arrowOffsetLeft = Math.round($target.offset().left + targetRect.width / 2 - $arrow.width() / 2);

            assert.strictEqual($content.offset().top, contentOffsetTop, 'popover content top offset is correct');
            assert.strictEqual($content.offset().left, contentOffsetLeft, 'popover content left offset is correct');
            assert.strictEqual($arrow.offset().top, arrowOffsetTop, 'arrow offset top is correct');
            assert.strictEqual($arrow.offset().left, arrowOffsetLeft, 'arrow offset left is correct');
        } finally {
            fixtures.svg.drop();
        }
    });

    QUnit.test('content left bottom position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 70,
                height: 70,
                animation: null,
                visible: true,
                position: { at: 'bottom left', my: 'top left', boundaryOffset: '0 0' }
            });

            const $popupContent = wrapper().find('.dx-popup-content');
            const $overlayContent = wrapper().find('.dx-overlay-content');
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($overlayContent.offset().left, 0, 'popover content left offset');
            assert.equal($popupContent.offset().top, $target.height() + $arrow.height(), 'popover content top offset');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content left bottom position with boundaryOffset', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 70,
                height: 70,
                animation: null,
                visible: true,
                position: { at: 'bottom left', my: 'top left', boundaryOffset: '25 25', collision: 'fit' }
            });

            const $popupContent = wrapper().find('.dx-popup-content');
            const $overlayContent = wrapper().find('.dx-overlay-content');
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($overlayContent.offset().left, 25, 'popover content left offset');
            assert.equal($popupContent.offset().top, $target.height() + $arrow.height(), 'popover content top offset');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content right top position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 70,
                height: 70,
                animation: null,
                visible: true,
                position: { at: 'right top', my: 'left top', boundaryOffset: '0 0' }
            });

            const $popupContent = wrapper().find('.dx-popup-content');
            const $overlayContent = wrapper().find('.dx-overlay-content');
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($popupContent.offset().left, $target.width() + $arrow.width(), 'popover content left offset');
            assert.equal($overlayContent.offset().top, 0, 'popover content top offset');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content right top position with boundaryOffset', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 70,
                height: 70,
                animation: null,
                visible: true,
                position: { at: 'right top', my: 'left top', boundaryOffset: '20 20', collision: 'fit' }
            });

            const $popupContent = wrapper().find('.dx-popup-content');
            const $overlayContent = wrapper().find('.dx-overlay-content');
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($popupContent.offset().left, $target.width() + $arrow.width(), 'popover content left offset');
            assert.equal($overlayContent.offset().top, 20, 'popover content top offset');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content position considering fit option', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $target,
                width: 800,
                height: 50,
                animation: null,
                visible: true
            });

            const $content = wrapper().find('.dx-overlay-content');
            const left = popover.option('boundaryOffset').h;

            assert.equal($content.offset().left, left, 'popover content positioned considering fit option');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content must not overlap bottom buttons (B252748)', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const popover = new Popover($('#what'), {
                target: $('#where'),
                visible: true,
                toolbarItems: [{ shortcut: 'cancel' }, { shortcut: 'clear' }, { shortcut: 'done' }],
                height: 100,
                width: 50
            });
            const $popoverContent = popover.$content();
            const $popoverBottom = popover.bottomToolbar();

            popover.show().done(function() {
                assert.equal($popoverBottom.offset().top, $popoverContent.offset().top + $popoverContent.outerHeight(true), 'content doesn\'t overlap bottom buttons');
            });
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('content must not overlap bottom toolbar after popover size change', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $where = $('#where');
            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $where,
                visible: true,
                toolbarItems: [{ toolbar: 'bottom', location: 'center', html: '<div style="height: 30px;"></div>' }],
                height: 100,
                position: {
                    my: 'top center',
                    at: 'bottom center',
                    collision: 'fit'
                }
            });
            const $overlayContent = $('.dx-overlay-content');
            const $popoverContent = popover.$content();
            const $popoverBottom = $popover.find('.dx-popup-bottom');

            $where.css('top', $(window).height() - $where.height() - $overlayContent.height());
            popover.repaint();

            popover.show().done(function() {
                assert.equal($popoverContent.outerHeight() + $popoverBottom.outerHeight(true), $overlayContent.height(), 'content doesn\'t overlap bottom buttons');
            });
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('content position inside of target', function(assert) {
        fixtures.frameAdapted.create();
        try {
            const $target = $('#where');
            const popover = new Popover($('#what'), {
                target: $target,
                width: 50,
                height: 50,
                animation: null,
                visible: true,
                position: { at: 'top', my: 'top', boundaryOffset: '0 0' }
            });

            const $content = wrapper().find('.dx-popup-content');
            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.equal($content.offset().top - $arrow.outerHeight(), $target.offset().top, 'popover top position is correct');

            popover.option('position', { at: 'bottom', my: 'bottom', boundaryOffset: '0 0' });
            assert.equal($content.offset().top + $content.outerHeight() + $arrow.outerHeight(), $target.offset().top + $target.outerHeight(), 'popover bottom position is correct');

            popover.option('position', { at: 'left', my: 'left', boundaryOffset: '0 0' });
            assert.equal($content.offset().left - $arrow.outerWidth(), $target.offset().left, 'popover left position is correct');

            popover.option('position', { at: 'right', my: 'right', boundaryOffset: '0 0' });
            assert.equal($content.offset().left + $content.outerWidth() + $arrow.outerWidth(), $target.offset().left + $target.outerWidth(), 'popover right position is correct');
        } finally {
            fixtures.frameAdapted.drop();
        }
    });
});

QUnit.module('positioning', () => {
    QUnit.test('position of popover with high content', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: 'bottom',
                height: 3000
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');
            const arrowOffsetTop = $target.offset().top - $arrow.height();

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow position above target');
            assert.equal($content[0].getBoundingClientRect().bottom, arrowOffsetTop, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('position of popover with wide content', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: 'right',
                popupWidth: 10000
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');
            const arrowOffsetLeft = $target.offset().left + $target.outerWidth();
            const contentOffsetLeft = arrowOffsetLeft + $arrow.width();

            assert.equal($arrow.offset().left, arrowOffsetLeft, 'arrow right position');
            assert.equal($content.offset().left, contentOffsetLeft, 'content right position');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('popover is placed above target', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            const $target = $('#where');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: { my: 'bottom center', at: 'top center' }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const target = elements.target;
            const arrow = elements.arrow;
            const content = elements.popupContent;

            assert.equal(parseInt(arrow.offsetTop + arrow.height, 10), parseInt(target.offsetTop, 10), 'arrow top is OK');
            assert.equal(parseInt(arrow.offsetLeft + arrow.width / 2, 10), parseInt(target.offsetLeft + target.width / 2, 10), 'arrow left is OK');
            assert.equal(content.offsetTop, arrow.offsetTop - content.height, 'content top is OK');
            assert.equal(content.offsetLeft + parseInt(content.outerWidth / 2, 10), arrow.offsetLeft + parseInt(arrow.width / 2, 10), 'content left is OK');

        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('popover rendering with position.of and target options', function(assert) {
        fixtures.simple.create();

        try {
            const $popover = $('#what');
            const $target = $('#where');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: { my: 'bottom center', at: 'top center', of: $target }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const target = elements.target;
            const arrow = elements.arrow;
            const content = elements.popupContent;

            assert.equal(parseInt(arrow.offsetTop + arrow.height, 10), parseInt(target.offsetTop, 10), 'arrow top is OK');
            assert.equal(parseInt(arrow.offsetLeft + arrow.width / 2, 10), parseInt(target.offsetLeft + target.width / 2, 10), 'arrow left is OK');
            assert.equal(content.offsetTop, arrow.offsetTop - content.height, 'content top is OK');
            assert.equal(content.offsetLeft + parseInt(content.outerWidth / 2, 10), arrow.offsetLeft + parseInt(arrow.width / 2, 10), 'content left is OK');
        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('popover shading should cover all window including scrolled space (T945429)', function(assert) {
        fixtures.simple.create();

        try {
            const $popover = $('#what');
            const $target = $('#where');

            $('<div>')
                .css('height', '2000px')
                .appendTo('body');

            new Popover($popover, {
                target: $target,
                visible: true,
                shading: true
            });

            const $shader = $('.dx-overlay-shader');

            assert.strictEqual($shader.height(), $(window).height(), 'shader height is equal to window height');
            assert.strictEqual($shader.width(), $(window).width(), 'shader width is equal to window width');
        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('popover is placed on the left of target', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            const $target = $('#where');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: { my: 'right center', at: 'left center' }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const target = elements.target;
            const arrow = elements.arrow;
            const content = elements.content;
            const popupContent = elements.popupContent;

            assert.equal(parseInt(arrow.offsetTop + arrow.height / 2, 10), parseInt(target.offsetTop + target.height / 2, 10), 'arrow top is OK');
            assert.equal(arrow.offsetLeft + arrow.width, target.offsetLeft, 'arrow left is OK');
            assert.equal(parseInt(content.offsetTop + content.height / 2, 10), parseInt(arrow.offsetTop + arrow.height / 2, 10), 'content top is OK');
            assert.equal(popupContent.offsetLeft, arrow.offsetLeft - popupContent.outerWidth, 'content left is OK');

        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('popover is placed on the right of target', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            const $target = $('#where');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: { my: 'left center', at: 'right center' }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const target = elements.target;
            const arrow = elements.arrow;
            const content = elements.content;
            const popupContent = elements.popupContent;

            assert.equal(parseInt(arrow.offsetTop + arrow.height / 2, 10), parseInt(target.offsetTop + target.height / 2, 10), 'arrow top is OK');
            assert.equal(arrow.offsetLeft, target.offsetLeft + target.width, 'arrow left is OK');
            assert.equal(parseInt(content.offsetTop + content.height / 2, 10), parseInt(arrow.offsetTop + arrow.height / 2, 10), 'content top is OK');
            assert.equal(popupContent.offsetLeft, arrow.offsetLeft + arrow.width, 'content left is OK');

        } finally {
            fixtures.simple.drop();
        }
    });

    QUnit.test('popover should not change it\'s position option during rendering', function(assert) {
        try {
            fixtures.simple.create();

            const popover = new Popover($('#what'), {
                target: $('#where'),
                visible: true,
                position: { my: 'left center', at: 'right center' }
            });

            assert.strictEqual(popover.option('position.of'), undefined, 'position was not changed');
        } finally {
            fixtures.simple.drop();
        }
    });
});

QUnit.module('flipping', () => {
    QUnit.test('flip for arrow and content', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: $target.height(),
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            const arrowOffsetTop = $target.offset().top - $arrow.height();

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow position above target');
            assert.equal($content[0].getBoundingClientRect().bottom, arrowOffsetTop, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('vertical offset is mirrored when popover is flipped', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: $target.height(),
                animation: null,
                visible: true,
                position: {
                    my: 'top center',
                    at: 'bottom center',
                    offset: '0 10'
                }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            const arrowOffsetTop = $target.offset().top - $arrow.height() - 10;

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow position above target');
            assert.equal($content[0].getBoundingClientRect().bottom, arrowOffsetTop, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('horizontal offset is mirrored when popover is flipped', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: 40,
                animation: null,
                visible: true,
                position: {
                    my: 'right center',
                    at: 'left center',
                    offset: '10 0'
                }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            const arrowOffsetLeft = $target.offset().left + $target.outerWidth() - 10;
            const contentOffsetLeft = $arrow.offset().left + $arrow.outerWidth();

            assert.equal($arrow.offset().left, arrowOffsetLeft, 'arrow position above target');
            assert.equal($content.offset().left, contentOffsetLeft, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('popover should be flipped only by necessary axis', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: 40,
                animation: null,
                visible: true,
                position: {
                    my: 'right bottom',
                    at: 'left top',
                    offset: '10 0'
                }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-overlay-content');

            assert.ok($content.offset().top + $arrow.outerHeight() < $target.offset().top, 'popover is not flipped vertically');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('flip for arrow and content when content height less than target height', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: $target.height() - 15,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $content = wrapper().find('.dx-popup-content');

            assert.equal($content[0].getBoundingClientRect().bottom, $arrow.offset().top, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('flip arrow with content when there is enough space for arrow but not for content', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const popoverHeight = 20;
            const $target = $('#where');
            const $popover = $('#what');

            $target.css({
                bottom: popoverHeight,
                height: 'initial'
            });

            new Popover($popover, {
                target: $target,
                height: popoverHeight,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $overlayContent = wrapper().find('.dx-overlay-content');
            const arrowOffsetTop = $target.offset().top - $arrow.height();
            const overlayContentBorderWidth = parseInt($overlayContent.css('borderBottomWidth'));
            const contentOffsetTop = arrowOffsetTop + overlayContentBorderWidth - $overlayContent.outerHeight();

            assert.equal($arrow.offset().top, arrowOffsetTop, 'arrow position above target');
            assert.equal($overlayContent.offset().top, contentOffsetTop, 'content position above arrow');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('arrow flipping', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: 20,
                animation: null,
                visible: true
            });

            assert.ok(wrapper().hasClass('dx-position-top'), 'arrow has flipping css class');
        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('flipping with top position', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: 20,
                animation: null,
                visible: true,
                position: { my: 'bottom center', at: 'top center' }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.ok(wrapper().hasClass('dx-position-bottom'), 'arrow has flipping css class');
            assert.equal($arrow.offset().top, $target.height());
            assert.equal($('.dx-popup-content').offset().top, $target.height() + $arrow.height());
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('flipping with bottom position', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                height: 20,
                animation: null,
                visible: true
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const $overlayContent = $('.dx-overlay-content');

            const arrowOffsetTop = $(window).height() - $target.height() - $arrow.height();
            const overlayContentBorderWidth = parseInt($overlayContent.css('borderBottomWidth'));
            const overlayContentOffsetTop = arrowOffsetTop + overlayContentBorderWidth - $overlayContent.outerHeight();

            assert.ok(wrapper().hasClass('dx-position-top'), 'arrow has flipping css class');
            assert.equal($arrow.offset().top, arrowOffsetTop);
            assert.equal($overlayContent.offset().top, overlayContentOffsetTop);

        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('flipping with left position', function(assert) {
        fixtures.collisionBottomLeft.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 200,
                animation: null,
                visible: true,
                position: { my: 'right center', at: 'left center' }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.ok(wrapper().hasClass('dx-position-right'), 'arrow has flipping css class');
            assert.equal($arrow.offset().left, $target.width());

            assert.equal($('.dx-popup-content').offset().left, $target.width() + $arrow.width());

        } finally {
            fixtures.collisionBottomLeft.drop();
        }
    });

    QUnit.test('flipping with right position', function(assert) {
        fixtures.collisionBottomRight.create();
        try {
            const $target = $('#where');
            const $popover = $('#what');

            new Popover($popover, {
                target: $target,
                width: 200,
                animation: null,
                visible: true,
                position: { my: 'left center', at: 'right center' }
            });

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);

            assert.ok(wrapper().hasClass('dx-position-left'), 'arrow has flipping css class');
            assert.equal($arrow.offset().left, $(window).width() - $target.width() - $arrow.width());
            assert.equal($('.dx-popup-content').offset().left, $(window).width() - $target.width() - $arrow.width() - $('.dx-popup-content').outerWidth());

        } finally {
            fixtures.collisionBottomRight.drop();
        }
    });
});

QUnit.module('animation', () => {
    QUnit.test('content position with animation type = \'slide\'', function(assert) {
        fixtures.collisionTopLeft.create();
        fx.off = true;
        try {
            const $target = $('#where');
            const $popover = $('#what');
            const popover = new Popover($popover, {
                target: $target,
                animation: {
                    show: { type: 'slide', from: { opacity: 1, top: -100 }, to: { top: 0 } },
                    hide: { type: 'slide', from: { top: 0 }, to: { top: -100 } }
                },
                width: 50,
                height: 50,
                visible: false
            });

            popover.option('visible', true);
            popover.option('visible', false);
            popover.option('visible', true);

            const $arrow = wrapper().find('.' + POPOVER_ARROW_CLASS);
            const arrowOffsetTop = $target.offset().top + $target.height();
            const arrowOffsetLeft = Math.round($target.offset().left + $target.width() / 2 - $arrow.width() / 2);

            assert.equal($arrow.offset().top, arrowOffsetTop, 'popover arrow positioned at the bottom of the target vertically');
            assert.equal($arrow.offset().left, arrowOffsetLeft, 'popover arrow positioned at the center of the target horizontally');
        } finally {
            fx.off = false;
            fixtures.collisionTopLeft.drop();
        }
    });
});

QUnit.module('behavior', () => {
    QUnit.test('close on outside click', function(assert) {
        fixtures.collisionTopLeft.create();
        try {
            const $popover = $('#what');
            const $target = $('#where');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true
            });

            const $content = wrapper().find('.dx-overlay-content');

            pointerMock($target)
                .start()
                .wait(600)
                .click();

            assert.ok($content.is(':visible'), 'content is visible when click on target element');

            pointerMock($('.dx-popup-content', $content))
                .start()
                .wait(600)
                .click();

            assert.ok($content.is(':visible'), 'content is visible when click on content');

            pointerMock($(document))
                .start()
                .wait(600)
                .click();

            assert.ok($content.is(':hidden'), 'content is hidden');
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });

    QUnit.test('popover should be visible on start when visible and deferRendering is false', function(assert) {
        fixtures.collisionTopLeft.create();

        try {
            const popover = new Popover($('#what'), { visible: false, deferRendering: false });
            assert.ok(popover.$content().is(':hidden'));
        } finally {
            fixtures.collisionTopLeft.drop();
        }
    });
});

QUnit.module('position offset', {
    beforeEach: function() {
        fixtures.simple.create();
        this.$target = $('#where').width(30).height(30);
        this.$popover = $('#what');
        this.popover = new Popover(this.$popover, {
            target: this.$target,
            animation: null,
            width: 22,
            height: 22,
            visible: true
        });

        fx.off = true;
    },
    afterEach: function() {
        fixtures.simple.drop();
        fx.off = false;
    }
}, () => {
    QUnit.test('right offset from the target container', function(assert) {
        this.popover.option('position', { my: 'left', at: 'right center', offset: '5 5' });
        const elements = getElementsPositionAndSize(this.$popover, this.$target);
        const content = elements.content;
        const popupContent = elements.popupContent;
        const target = elements.target;
        const arrow = elements.arrow;

        assert.equal(Math.round(arrow.offsetLeft - target.offsetLeft - target.width), 5, 'arrow with left offset is OK');
        assert.equal(Math.round(arrow.offsetTop - target.offsetTop + (arrow.height - target.height) / 2), 5, 'arrow with top offset is OK');

        assert.equal(Math.round(popupContent.offsetLeft - (target.offsetLeft + target.width + arrow.width)), 5, 'content with left offset is OK');
        assert.equal(Math.round(content.offsetTop - (target.offsetTop + (target.height - content.height) / 2)), 5, 'content with top offset is OK');
    });

    QUnit.test('left offset from the target container', function(assert) {
        this.popover.option('position', { my: 'right', at: 'left center', offset: '-5 -5' });
        const elements = getElementsPositionAndSize(this.$popover, this.$target);
        const content = elements.content;
        const popupContent = elements.popupContent;
        const target = elements.target;
        const arrow = elements.arrow;

        assert.equal(Math.round(target.offsetLeft - arrow.offsetLeft - arrow.width), 5, 'arrow with right offset is OK');
        assert.equal(Math.round(arrow.offsetTop - (target.offsetTop + (target.height - arrow.height) / 2)), -5, 'arrow with bottom offset is OK');

        assert.equal(Math.round(target.offsetLeft - (popupContent.offsetLeft + popupContent.outerWidth + arrow.width)), 5, 'content with right offset is OK');
        assert.equal(Math.round(target.offsetTop + (target.height - content.height) / 2 - content.offsetTop), 5, 'content with top offset is OK');
    });

    QUnit.test('top offset from the target container', function(assert) {
        this.popover.option('position', { my: 'bottom', at: 'top center', offset: '0 -5' });
        const elements = getElementsPositionAndSize(this.$popover, this.$target);
        const popupContent = elements.popupContent;
        const target = elements.target;
        const arrow = elements.arrow;

        assert.equal(Math.round(target.offsetLeft + target.width / 2) - (arrow.offsetLeft + arrow.width / 2), 0, 'arrow with bottom offset is OK');
        assert.equal(Math.round(target.positionTop - (arrow.offsetTop + arrow.height)), 5, 'arrow with bottom offset is OK');

        assert.equal(Math.round(target.offsetLeft + target.width / 2 - (popupContent.offsetLeft + popupContent.outerWidth / 2)), 0, 'content with bottom offset is OK');
        assert.equal(Math.round(target.positionTop - (popupContent.offsetTop + popupContent.height + arrow.height)), 5, 'content with bottom offset is OK');
    });

    QUnit.test('bottom offset from the target container', function(assert) {
        this.popover.option('position', { my: 'top', at: 'bottom center', offset: '0 5' });
        const elements = getElementsPositionAndSize(this.$popover, this.$target);
        const popupContent = elements.popupContent;
        const target = elements.target;
        const arrow = elements.arrow;

        assert.equal(Math.round((arrow.offsetLeft + arrow.width / 2) - target.offsetLeft - target.width / 2), 0, 'arrow with top offset is OK');
        assert.equal(Math.round(arrow.offsetTop - target.positionTop - target.height), 5, 'arrow with top offset is OK');

        assert.equal(Math.round(target.offsetLeft + target.width / 2 - popupContent.offsetLeft - popupContent.outerWidth / 2), 0, 'content with top offset is OK');
        assert.equal(Math.round(popupContent.offsetTop - arrow.height - target.height - target.offsetTop), 5, 'content with top offset is OK');
    });

    QUnit.test('animation of popover should run correctly when the \'animation.show.to.position\' is not set', function(assert) {

        const $target = $('#where');

        positionAtWindowCenter($target);

        const popoverPosition = {
            my: 'top center',
            at: 'bottom center'
        };

        const animationOptions = {
            show: {
                type: 'slide',
                duration: 1000,
                from: {
                    opacity: 0,
                    top: '+=50'
                },
                to: {
                    opacity: 1
                }
            }
        };

        this.popover.option({
            target: $target,
            position: popoverPosition,
            animation: animationOptions,
            visible: true,
            width: 50,
            height: 50,
        });

        this.popover.show();

        const elements = getElementsPositionAndSize(this.$popover, $target);
        const popupContent = elements.popupContent;
        const target = elements.target;
        const arrow = elements.arrow;

        assert.equal(Math.round((arrow.offsetLeft + arrow.width / 2) - target.offsetLeft - target.width / 2), 0, 'arrow left is OK');
        assert.equal(Math.round(arrow.offsetTop - target.positionTop - target.height), 0, 'arrow top is OK');

        assert.equal(Math.round(target.offsetLeft + target.width / 2 - popupContent.offsetLeft - popupContent.outerWidth / 2), 0, 'content left is OK');
        assert.equal(Math.round(popupContent.offsetTop - arrow.height - target.height - target.offsetTop), 0, 'content top is OK');
    });
});

QUnit.module('popover content size', () => {
    QUnit.test('popover content height is reduced to fit in boundaries by height', function(assert) {
        fixtures.customBoundary.create();
        try {
            const $content = $('<div>').css('backgroundColor', 'black').width(20).height(200);
            const $popover = $('#what').append($content);
            const $target = $('#where');
            const $boundary = $('#boundary');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: {
                    my: 'top center',
                    at: 'bottom center',
                    of: $target,
                    boundary: $boundary,
                    boundaryOffset: '0 0'
                }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const content = elements.content;
            const target = elements.target;
            const arrow = elements.arrow;

            assert.equal(content.height, $boundary.height() - target.positionTop - target.height - arrow.height + content.borderWidth, 'content shrunk to available space by height');

        } finally {
            fixtures.customBoundary.drop();
        }
    });

    QUnit.test('popover content height is not reduced when fit is allowed', function(assert) {
        fixtures.customBoundary.create();
        const contentSize = 100;
        try {
            const $content = $('<div>').css('backgroundColor', 'black').width(20).height(contentSize);
            const $popover = $('#what').append($content);
            const $target = $('#where');
            const $boundary = $('#boundary');
            const popover = new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: {
                    my: 'top center',
                    at: 'bottom center',
                    of: $target,
                    boundary: $boundary,
                    boundaryOffset: '0 0',
                    collision: 'fit'
                }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const content = elements.content;

            const $popupContent = popover.$content();
            const overlayContentBordersHeight = 2;
            assert.equal(content.height - overlayContentBordersHeight, contentSize + $popupContent.outerHeight() - $popupContent.height(), 'content shrunk to available space by height');
        } finally {
            fixtures.customBoundary.drop();
        }
    });

    QUnit.test('popover content height shrinking considers existing offset', function(assert) {
        fixtures.customBoundary.create();
        try {
            const $content = $('<div>').css('backgroundColor', 'black').width(20).height(200);
            const verticalOffset = 50;
            const $popover = $('#what').append($content);
            const $target = $('#where');
            const $boundary = $('#boundary');

            new Popover($popover, {
                target: $target,
                animation: null,
                visible: true,
                position: {
                    my: 'top center',
                    at: 'bottom center',
                    of: $target,
                    offset: '0 ' + verticalOffset,
                    boundary: $boundary,
                    boundaryOffset: '0 0'
                }
            });

            const elements = getElementsPositionAndSize($popover, $target);
            const content = elements.content;
            const target = elements.target;
            const arrow = elements.arrow;

            assert.equal(content.height, $boundary.height() - target.positionTop - target.height - verticalOffset - arrow.height + content.borderWidth, 'content shrunk to available space by height');

        } finally {
            fixtures.customBoundary.drop();
        }
    });
});

QUnit.module('Show/Hide', {
    beforeEach: function() {
        fixtures.simple.create();
        this.clock = sinon.useFakeTimers();
    },
    afterEach: function() {
        fixtures.simple.drop();
        this.clock.restore();
    }
}, () => {
    QUnit.test('Popover should switch to the target set as function parameter', function(assert) {
        const popover = new Popover($('#what'));
        const $target = $('#where');

        popover.show($target);

        assert.equal(popover.option('target'), $target);
    });

    QUnit.test('showEvent set as string', function(assert) {
        const instance = new Popover($('#what'), {
            target: '#where',
            showEvent: 'dxclick'
        });

        $('#where').trigger('dxclick');
        assert.ok(instance.option('visible'), 'Popover was shown');
    });

    QUnit.test('popover should be hidden after change the showEvent option', function(assert) {
        const instance = new Popover($('#what'), {
            target: '#where',
            showEvent: 'dxclick',
            visible: true
        });

        instance.option('showEvent', 'mouseenter');
        assert.notOk(instance.option('visible'), 'popover is hidden');
    });

    QUnit.test('popover should be hidden after change the hideEvent option', function(assert) {
        const instance = new Popover($('#what'), {
            target: '#where',
            hideEvent: 'dxclick',
            visible: true
        });

        instance.option('hideEvent', 'mouseenter');
        assert.notOk(instance.option('visible'), 'popover is hidden');
    });

    QUnit.test('clear the showEvent on runtime', function(assert) {
        const shownStub = sinon.stub();
        const instance = new Popover($('#what'), {
            target: '#where',
            showEvent: { name: 'mouseenter', delay: 500 },
            onShown: shownStub
        });

        instance.option('showEvent', undefined);
        $('#where').trigger('mouseenter');
        this.clock.tick(500);

        assert.equal(shownStub.callCount, 0, 'Popover wasn\'t shown');
    });

    QUnit.test('showEvent set as string with several events', function(assert) {
        const instance = new Popover($('#what'), {
            target: '#where',
            showEvent: 'dxclick dxhover'
        });

        $('#where').trigger('dxclick');
        assert.ok(instance.option('visible'), 'popover was shown');

        instance.hide();
        assert.ok(!instance.option('visible'));

        $('#where').trigger('dxhover');
        assert.ok(instance.option('visible'), 'popover was shown');
    });

    QUnit.test('showEvent set as object', function(assert) {
        const instance = new Popover($('#what'), {
            target: '#where',
            showEvent: {
                name: 'dxclick',
                delay: 500
            }
        });

        $('#where').trigger('dxclick');
        assert.ok(!instance.option('visible'));
        this.clock.tick(500);
        assert.ok(instance.option('visible'), 'popover was shown');
    });

    QUnit.test('hideEvent set as string', function(assert) {
        const instance = new Popover($('#what'), {
            visible: true,
            target: '#where',
            hideEvent: 'dxclick'
        });

        assert.ok(instance.option('visible'), 'Popover was shown');

        $('#where').trigger('dxclick');
        assert.ok(!instance.option('visible'), 'Popover was hidden');
    });

    QUnit.test('hideEvent set as string with several events', function(assert) {
        const instance = new Popover($('#what'), {
            visible: true,
            target: '#where',
            hideEvent: 'dxclick dxhover'
        });

        assert.ok(instance.option('visible'), 'Popover was shown');

        $('#where').trigger('dxclick');
        assert.ok(!instance.option('visible'), 'Popover was hidden');

        instance.show();
        assert.ok(instance.option('visible'), 'Popover was shown');

        $('#where').trigger('dxclick');
        assert.ok(!instance.option('visible'), 'Popover was hidden');
    });

    QUnit.test('hideEvent set as object', function(assert) {
        const instance = new Popover($('#what'), {
            visible: true,
            target: '#where',
            hideEvent: {
                name: 'dxclick',
                delay: 500
            }
        });

        assert.ok(instance.option('visible'), 'Popover was shown');

        $('#where').trigger('dxclick');
        assert.ok(instance.option('visible'), 'popover was shown');

        this.clock.tick(500);
        assert.ok(!instance.option('visible'), 'Popover was hidden');
    });

    QUnit.test('second popover should be hidden by click on the first\'s target', function(assert) {
        const markup = '<div id=\'popover1\'></div>' +
            '<div id=\'popover2\'></div>' +
            '<div id=\'target1\'></div>' +
            '<div id=\'target2\'><div id=\'clicktarget2\'></div></div>';

        $(markup).appendTo('body');

        const popover1 = new Popover($('#popover1'), { visible: true, animation: false, target: '#target1' });
        const popover2 = new Popover($('#popover2'), { visible: true, animation: false, target: '#target2' });

        $('#clicktarget2').trigger('dxpointerdown');

        assert.ok(popover2.option('visible'), 'popover2 is still visible');
        assert.notOk(popover1.option('visible'), 'popover1 is hidden');
    });

    QUnit.test('popover should clear show timeout when hide event fired', function(assert) {
        const instance = new Popover($('#what'), {
            visible: false,
            target: '#where',
            showEvent: {
                name: 'pointerenter',
                delay: 500
            },
            hideEvent: {
                name: 'pointerleave'
            }
        });

        $('#where').trigger('pointerenter');
        this.clock.tick(300);
        $('#where').trigger('pointerleave');
        this.clock.tick(200);

        assert.notOk(instance.option('visible'), 'Showing has been cancelled');
    });

    QUnit.test('popover should clear hide timeout when show event fired', function(assert) {
        const instance = new Popover($('#what'), {
            visible: true,
            target: '#where',
            showEvent: {
                name: 'pointerenter'
            },
            hideEvent: {
                name: 'pointerleave',
                delay: 500
            }
        });

        $('#where').trigger('pointerleave');
        this.clock.tick(300);
        $('#where').trigger('pointerenter');
        this.clock.tick(200);

        assert.ok(instance.option('visible'), 'Hiding has been cancelled');
    });

    QUnit.test('popover should clear old show timeout when show event fired (T829575)', function(assert) {
        const $target = $('#where');
        const instance = new Popover($('#what'), {
            target: $target,
            showEvent: {
                name: 'dxhoverstart',
                delay: 100,
            },
            hideEvent: {
                name: 'dxhoverend'
            }
        });

        $target.trigger('dxhoverstart');
        $target.trigger('dxhoverstart');
        $target.trigger('dxhoverend');

        this.clock.tick(200);

        assert.notOk(instance.option('visible'), 'Popover is hidden');
    });

    QUnit.test('popover should clear show timeout when show method is called', function(assert) {
        const instance = new Popover($('#what'), {
            visible: false,
            target: '#where',
            showEvent: {
                name: 'pointerenter',
                delay: 500
            },
            hideEvent: {
                name: 'pointerleave'
            }
        });

        $('#where').trigger('pointerenter');
        this.clock.tick(200);

        instance.show();
        instance.hide();

        this.clock.tick(300);
        assert.notOk(instance.option('visible'), 'Showing has been cancelled');
    });

    QUnit.test('popover should clear hide timeout when hide method is called', function(assert) {
        const instance = new Popover($('#what'), {
            visible: true,
            target: '#where',
            showEvent: {
                name: 'pointerenter'
            },
            hideEvent: {
                name: 'pointerleave',
                delay: 500
            }
        });

        $('#where').trigger('pointerleave');
        this.clock.tick(200);

        instance.hide();
        instance.show();

        this.clock.tick(300);
        assert.ok(instance.option('visible'), 'Hiding has been cancelled');
    });
});

QUnit.module('renderGeometry', () => {
    QUnit.test('option change', function(assert) {
        fixtures.simple.create();
        try {
            const $popover = $('#what');
            const instance = new Popover($popover, { visible: true });
            const newOptions = {
                boundaryOffset: { h: 40, v: 40 },
                arrowPosition: {
                    boundaryOffset: { h: 30, v: 20 },
                    collision: 'fit'
                },
                arrowOffset: 24
            };
            const renderGeometrySpy = sinon.spy(instance, '_renderGeometry');

            for(const optionName in newOptions) {
                const initialCallCount = renderGeometrySpy.callCount;

                instance.option(optionName, newOptions[optionName]);

                const isDimensionChanged = !!renderGeometrySpy.lastCall.args[0];
                assert.ok(initialCallCount < renderGeometrySpy.callCount, 'renderGeomentry callCount has increased');
                assert.notOk(isDimensionChanged);
            }
        } finally {
            fixtures.simple.drop();
        }
    });
});
