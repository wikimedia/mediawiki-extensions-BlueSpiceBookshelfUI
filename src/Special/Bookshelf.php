<?php

namespace BlueSpice\BookshelfUI\Special;

use BlueSpice\SpecialPage;
use Html;

class Bookshelf extends SpecialPage {
	/**
	 *
	 */
	public function __construct() {
		parent::__construct( 'Bookshelf', 'bookshelf-viewspecialpage' );
	}

	/**
	 * @param string $subPage
	 */
	public function execute( $subPage ) {
		parent::execute( $subPage );

		$this->getOutput()->addHTML(
			Html::element( 'div', [
				'id' => 'bs-bookshelf-container',
				'style' => 'height: 1000px',
				'class' => 'dynamic-graphical-list-body'
			] )
		);
		$this->getOutput()->addModules( "ext.bluespice.bookshelfUI.special" );
	}
}
