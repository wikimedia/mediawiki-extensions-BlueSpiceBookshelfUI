<?php

namespace BlueSpice\BookshelfUI;

use PageHierarchyProvider;
use BSTreeNode;

class SidebarTreeNavigation extends \BSSkinTreeNavigation {

	protected $skinTemplate = null;

	public function __construct( $template, \DOMElement $domElement = null, $indent = 0) {
		$this->skinTemplate = $template;
	}

	public function getSkinTemplate() {
		return $this->skinTemplate;
	}

	/**
	 *
	 * @var \PageHierarchyProvider
	 */
	protected $phProvider = null;

	/**
	 *
	 * @var string
	 */
	protected $rootNodeId = '';

	protected function getContainerID() {
		return 'bs-bookshelfui-book-toc';
	}

	protected function makeTreeRootNode() {
		$tree = $this->phProvider->getExtendedTOCJSON();

		$rootNode = new BSTreeNode( $tree->text, null, new \HashConfig( [
			BSTreeNode::CONFIG_EXPANDED => true,
			BSTreeNode::CONFIG_IS_LEAF => false,
			BSTreeNode::CONFIG_TEXT => $tree->articleDisplayTitle,
		] ) );
		$this->rootNodeId = $rootNode->getId();
		$this->addChildsToNode( $rootNode, $tree->children );

		return $rootNode;
	}

	protected function getPathsToExpand() {
		$number = $this->phProvider->getNumberFor(
			$this->skinTemplate->getSkin()->getTitle()->getPrefixedText()
		);

		$path = $this->makeExpandPath( $number );

		return [ $path ];
	}

	public function getHtml() {
		try {
			$this->phProvider = PageHierarchyProvider::getInstanceForArticle(
				$this->skinTemplate->getSkin()->getTitle()->getPrefixedText()
			);
		} catch ( \Exception $ex) {
			return '';
		}

		$treeHtml = parent::getHtml();

		$tree = $this->phProvider->getExtendedTOCJSON();
		$bookTitle = $tree->bookshelf->page_title;
		$bookMeta = $this->phProvider->getBookMeta();
		if( isset( $bookMeta['title'] ) ) {
			$bookTitle = $bookMeta['title'];
		}

		$bookEditor = \Title::makeTitle( NS_SPECIAL, 'BookshelfBookUI/Book:' . $tree->bookshelf->page_title );

		$bookEditorLink = \Html::openElement(
			'a',
			[
				'class' => 'bs-link-edit-bookshelfui-book',
				'href' => $bookEditor->getFullURL(),
				'title' => wfMessage( 'bs-link-edit-bookshelfui-book-title' )->plain()
			]
		);

		$bookEditorLink .= \Html::element(
			'span',
			[
				'class' => 'label'
			],
			wfMessage( 'bs-link-edit-bookshelfui-book-text' )->plain()
		);

		$bookEditorLink .= \Html::closeElement( 'a' );

		$headingHtml = \Html::element(
			'h5',
			[],
			$bookTitle
		);

		return '<div class="bs-bookshelfui-book">' . $headingHtml . '</div>' . $treeHtml . $bookEditorLink;
	}

	/**
	 *
	 * @param \BSTreeNode $node
	 * @param strClass $childs
	 */
	protected function addChildsToNode( $node, $childs ) {
		foreach( $childs as $child ) {
			$childNode = new BSTreeNode( $child->id, $node, new \HashConfig( [
				BSTreeNode::CONFIG_EXPANDED => false,
				BSTreeNode::CONFIG_IS_LEAF => false,
				BSTreeNode::CONFIG_TEXT => $this->makeNodeText( $child )
			] ) );

			$node->appendChild( $childNode );

			if( isset( $child->children ) && !empty( $child->children ) ) {
				$this->addChildsToNode( $childNode,  $child->children );
			}
		}
	}

	protected function makeNodeText( $node ) {
		if( $node->articleType  === 'plain-text' ) {
			return $this->makePlainTextNodeText( $node );
		}
		if( $node->articleType  === 'wikilink-with-alias' ) {
			return $this->makeWikiPageNodeText( $node );
		}
		if( $node->articleType  === 'wikilink' ) {
			return $this->makeWikiPageNodeText( $node );
		}
	}

	protected function makePlainTextNodeText( $node ) {
		return \Html::element(
			'a',
			[
				'level' => $node->articleNumber,
				'name' => $node->articleNumber,
				'title' => $node->text
			],
			$node->text
		);
	}

	protected function makeWikiPageNodeText( $node ) {
		$currentTitle = $this->getSkinTemplate()->getSkin();
		$target = \Title::newFromText( $node->articleTitle );

		$num = '<span class="bs-articleNumber">' . $node->articleNumber . '.</span>';
		$title = '<span class="bs-articleText">' . str_replace( $node->articleNumber . '. ', '', $node->text ) . '</span>';

		$attribs = [
			'name' => $node->articleNumber,
			'title' => $node->text
		];

		if( $currentTitle->getTitle()->equals( $target ) ) {
			$attribs['class'] = 'active';
		}

		return \Linker::link( $target, $num . $title, $attribs );
	}

	protected function makeExpandPath( $number ) {
		$numberParts = explode( '.', $number );
		$path = [ \Sanitizer::escapeId( $number ) ];
		$count = count( $numberParts );
		for( $i = 0; $i <= $count; $i++ ) {
			array_pop( $numberParts );
			$id = implode( '.', $numberParts );
			if( empty( $id ) ) {
				continue;
			}
			$path[] = \Sanitizer::escapeId( $id );
		}
		$path[] = \Sanitizer::escapeId( $this->rootNodeId );
		$path[] = '';

		return implode( '/', array_reverse( $path ) );
	}
}