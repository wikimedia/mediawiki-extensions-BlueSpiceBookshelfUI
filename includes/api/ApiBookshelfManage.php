<?php

class ApiBookshelfManage extends BSApiTasksBase {
	protected $aTasks = array(
		'deleteBook'
	);

	protected function getRequiredTaskPermissions() {
		return array(
			'deleteBook' => array( 'edit' )
		);
	}

	public function getDescription() {
		return 'Allows management of books inside the wiki';
	}

	public function task_deleteBook( $aTaskData, $aParams ) {
		$oResult = $this->makeStandardReturn();

		$oTitle = Title::newFromId( $aTaskData->book_page_id );
		if( !($oTitle instanceof Title ) ) {
			$oResult->message = $oResult->errors['pageid'] =
				wfMessage( 'bs-bookshelfui-bookmanager-deletion-error-pageid' )->text();
			return $oResult;
		}

		if( !$oTitle->userCan( 'delete' ) ) {
			$oResult->message = $oResult->errors['permission'] =
				wfMessage( 'bs-bookshelfui-bookmanager-deletion-error-permission' )->text();
			return $oResult;
		}

		$oArticle = new Article( $oTitle );
		$error = '';
		$oResult->success = $oArticle->doDeleteArticle(
			wfMessage( 'bs-bookshelfui-bookmanager-deletion-reason' )->text(),
			false,
				0,
				true,
				$error
		);

		if($oResult->success == false) {
			$oResult->message =
				wfMessage( 'bs-bookshelfui-bookmanager-deletion-error-unkown' )->text();
			$oResult->errors['saving'] = $error;
			$dbw = wfGetDB( DB_MASTER );
			wfDebugLog(
				'BS::Bookshelf',
				'SpecialBookshelfBookManager::ajaxDeleteBook: '.$dbw->lastQuery()
			);
		}

		return $oResult;
	}
}