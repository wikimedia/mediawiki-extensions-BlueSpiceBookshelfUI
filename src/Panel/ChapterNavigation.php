<?php

namespace BlueSpice\BookshelfUI\Panel;

use BlueSpice\BookshelfUI\SidebarTreeNavigation;
use BlueSpice\Calumma\IActiveStateProvider;
use BlueSpice\Calumma\Panel\BasePanel;
use Message;

class ChapterNavigation extends BasePanel implements IActiveStateProvider {

	/**
	 *
	 * @return string
	 */
	public function getBody() {
		$navigation = new SidebarTreeNavigation( $this->skintemplate );
		$treeHtml = $navigation->getHtml();

		return $treeHtml;
	}

	/**
	 *
	 * @return Message
	 */
	public function getTitleMessage() {
		// TODO: Use title of current book!
		return new \RawMessage( '' );
	}

	/**
	 *
	 * @return string
	 */
	public function getHtmlId() {
		return 'bs-bookshelfui-chapter-nav';
	}

	/**
	 *
	 * @return bool
	 */
	public function isActive() {
		try {
			$phProvider = \PageHierarchyProvider::getInstanceForArticle(
				$this->skintemplate->getSkin()->getTitle()->getPrefixedText()
			);
		} catch ( \Exception $ex ) {
			return false;
		}

		return true;
	}
}
