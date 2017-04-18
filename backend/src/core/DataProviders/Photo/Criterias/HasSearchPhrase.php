<?php

namespace Core\DataProviders\Photo\Criterias;

use Lib\DataProvider\Contracts\Criteria;

/**
 * Class HasSearchPhrase.
 *
 * @property string searchPhrase
 * @package Core\DataProviders\Photo\Criterias
 */
class HasSearchPhrase implements Criteria
{
    /**
     * HasSearchPhrase constructor.
     *
     * @param string $searchPhrase
     */
    public function __construct(string $searchPhrase)
    {
        $this->searchPhrase = $searchPhrase;
    }

    /**
     * Get search phrase words.
     *
     * @return array
     */
    protected function getSearchPhraseWords() : array
    {
        return explode(' ', $this->searchPhrase);
    }

    /**
     * Count search phrase words.
     *
     * @return int
     */
    protected function countSearchPhraseWords() : int
    {
        return count($this->getSearchPhraseWords());
    }

    /**
     * @inheritdoc
     */
    public function apply($query)
    {
        $whereSearchPhraseScope = function ($query, string $searchPhrase) {
            $query
                ->where('photos.description', 'like', "%{$searchPhrase}%")
                ->orWhereHas('tags', function ($query) use ($searchPhrase) {
                    $query->where('tags.value', 'like', "%{$searchPhrase}%");
                });
        };

        $query->where(function ($query) use ($whereSearchPhraseScope) {
            // Search by whole search phrase.
            $query->where(function ($query) use ($whereSearchPhraseScope) {
                $whereSearchPhraseScope($query, $this->searchPhrase);
            });

            if ($this->countSearchPhraseWords() > 1) {
                $query->orWhere(function ($query) use ($whereSearchPhraseScope) {
                    // Search by each word separately.
                    foreach ($this->getSearchPhraseWords() as $searchPhrase) {
                        $query->where(function ($query) use ($whereSearchPhraseScope, $searchPhrase) {
                            $whereSearchPhraseScope($query, $searchPhrase);
                        });
                    }
                });
            }
        });
    }
}
