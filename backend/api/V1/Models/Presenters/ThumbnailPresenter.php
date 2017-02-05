<?php

namespace Api\V1\Models\Presenters;

use Tooleks\Laravel\Presenter\Presenter;

/**
 * Class TokenPresenter.
 *
 * @property string absolute_url
 * @property int width
 * @property int height
 * @package Api\V1\Models\Presenters
 */
class ThumbnailPresenter extends Presenter
{
    /**
     * @inheritdoc
     */
    protected function getAttributesMap() : array
    {
        return [
            'absolute_url' => function () {
                return $this->getPresenteeAttribute('relative_url')
                    ? url(config('app.url')) . $this->getPresenteeAttribute('relative_url')
                    : null;
            },
            'width' => 'width',
            'height' => 'height',
        ];
    }
}
