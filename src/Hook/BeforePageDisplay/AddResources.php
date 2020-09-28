<?php

namespace BlueSpice\BookshelfUI\Hook\BeforePageDisplay;

class AddResources extends \BlueSpice\Hook\BeforePageDisplay {

	protected function doProcess() {
		$this->out->addModuleStyles( 'ext.bluespice.bookshelfUI.navigationTab.styles' );
		$this->out->addModules( 'ext.bluespice.bookshelfUI.navigationTab' );
		$this->out->addModuleStyles( 'ext.bluespice.bookshelfUI.pager.navigation.styles' );

		$config = $this->getConfig();
		$pagerBeforeContent = $config->get( 'BookShelfUIShowChapterNavigationPagerBeforeContent' );
		$pagerAfterContent = $config->get( 'BookShelfUIShowChapterNavigationPagerAfterContent' );

		if ( ( $pagerBeforeContent === true ) || ( $pagerBeforeContent === 1 ) ) {
				$this->out->addModuleStyles( 'ext.bluespice.bookshelfUI.pager.before-content.styles' );
		}

		if ( ( $pagerAfterContent === true ) || ( $pagerAfterContent === 1 ) ) {
				$this->out->addModuleStyles( 'ext.bluespice.bookshelfUI.pager.after-content.styles' );
		}
	}

}