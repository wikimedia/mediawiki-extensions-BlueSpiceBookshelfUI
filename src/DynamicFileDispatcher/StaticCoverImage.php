<?php

namespace BlueSpice\BookshelfUI\DynamicFileDispatcher;

use BlueSpice\DynamicFileDispatcher\AbstractStaticFile;

class StaticCoverImage extends AbstractStaticFile {

	/**
	 *
	 * @return string
	 */
	protected function getAbsolutePath() {
		return $this->dfd->getConfig()->get( 'BookshelfUIDefaultCoverImage' );
	}
}
