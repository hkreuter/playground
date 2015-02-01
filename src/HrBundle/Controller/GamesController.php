<?php
/**
 * Created by PhpStorm.
 * User: H.R.
 * Date: 15/01/15
 * Time: 23:10
 */

namespace HrBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class GamesController extends Controller
{
    private $_games = array( 'simulation', 'solitaire', 'gems', 'memory', 'tiles', 'tests' );

    /**
     * @Route("/app/games/{page}", name="start"), defaults={"page" = 'index'})
     */
    public function indexAction($page)
    {
        if ( !in_array($page, $this->_games) ) {
            $page = 'index';
        }

        $template = "HrBundle:Games:$page.html.twig";

        return $this->render($template);
    }

}
