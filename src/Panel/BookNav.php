<?php

namespace BlueSpice\BookshelfUI\Panel;

use BlueSpice\Calumma\IActiveStateProvider;
use BlueSpice\Calumma\Panel\PanelContainer;

class BookNav extends PanelContainer implements IActiveStateProvider {

	/**
	 *
	 * @return array
	 */
	protected function makePanels() {
		return [
			'general-books' => new GeneralBooksFlyout( $this->skintemplate ),
			'chapter-navigation' => new ChapterNavigation( $this->skintemplate )
		];
	}

	/**
	 *
	 * @return Message
	 */
	public function getTitleMessage() {
		return wfMessage( 'bs-bookshelf-specialpage-title' );
	}

	/**
	 *
	 * @return string
	 */
	public function getHtmlId() {
		return 'bs-nav-section-bs-bookshelfui';
	}

	/**
	 *
	 * @return bool
	 */
	public function isActive() {
		$panels = $this->makePanels();
		foreach ( $panels as $panel ) {
			if ( ( $panel instanceof IActiveStateProvider ) ) {

				if ( $panel->isActive() ) {
					return true;
				}
			}
		}
		return false;
	}
}
