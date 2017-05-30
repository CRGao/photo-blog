<?php

namespace Lib\Rss;

use Lib\Rss\Contracts\RssEnclosure as RssEnclosureContract;

/**
 * Class RssEnclosure.
 *
 * @package Lib\Rss
 */
class RssEnclosure implements RssEnclosureContract
{
    /**
     * @var string
     */
    protected $url = '';

    /**
     * @var string
     */
    protected $length = '';

    /**
     * @var string
     */
    protected $type = '';

    /**
     * @inheritdoc
     */
    public function getUrl(): string
    {
        return $this->url;
    }

    /**
     * @inheritdoc
     */
    public function setUrl(string $url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function getLength(): string
    {
        return $this->length;
    }

    /**
     * @inheritdoc
     */
    public function setLength(string $length)
    {
        $this->length = $length;

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @inheritdoc
     */
    public function setType(string $type)
    {
        $this->type = $type;

        return $this;
    }
}
