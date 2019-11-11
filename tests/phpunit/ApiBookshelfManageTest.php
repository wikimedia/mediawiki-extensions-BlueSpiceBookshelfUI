<?php

namespace BlueSpice\BookshelfUI\Tests;

use Title;
use BlueSpice\Tests\BSApiTasksTestBase;

/**
 * @group medium
 * @group API
 * @group Database
 * @group BlueSpice
 * @group BlueSpiceBookmaker
 */
class ApiBookshelfManageTest extends BSApiTasksTestBase {
	protected function getModuleName() {
		return 'bs-bookshelf-manage';
	}

	public function setUp() {
		parent::setUp();
		$this->insertPage( 'Book:Dummy', '<bookmeta title="Dummy book"/>' );
	}

	public function testDeleteBook() {
		$oTitle = Title::newFromText( "Dummy", NS_BOOK );

		$oResponse = $this->executeTask(
			'deleteBook',
			[
				'book_page_id' => $oTitle->getArticleID()
			]
		);

		$this->assertTrue( $oResponse->success, 'DeleteBook task failed' );
	}

	
}
