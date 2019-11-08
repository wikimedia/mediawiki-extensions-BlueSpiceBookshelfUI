<?php

namespace BlueSpice\BookshelfUI\DynamicFileDispatcher;

use BlueSpice\DynamicFileDispatcher\AbstractStaticFile;

class StaticCoverImage extends AbstractStaticFile {
	protected function getAbsolutePath() {
		return $this->dfd->getConfig()->get( 'BookshelfUIDefaultCoverImage' );
	}
}